/**
 * @jest-environment jsdom
 */

// Mock BaseMiddleware before requiring PermissionController
const mockBaseMiddleware = {
  prototype: {
    constructor: function(dependencies = {}, config = {}) {
      this.dependencies = dependencies;
      this.config = config;
      this.eventListeners = new Map();
      this.isInitialized = false;
      this.emit = jest.fn();
      this.on = jest.fn();
      this.off = jest.fn();
      this.getState = jest.fn();
      this.getDependency = jest.fn();
      this.getConfig = jest.fn();
      this.getNestedValue = jest.fn();
      this.generateId = jest.fn(() => 'test-id-123');
      this.safeJsonParse = jest.fn();
      this.safeJsonStringify = jest.fn();
    }
  }
};

// Set up global mocks
global.window = global.window || {};
global.window.BaseMiddleware = function(dependencies = {}, config = {}) {
  mockBaseMiddleware.prototype.constructor.call(this, dependencies, config);
};
Object.setPrototypeOf(global.window.BaseMiddleware.prototype, mockBaseMiddleware.prototype);

// Mock dependencies
const mockWorkflowManager = {
  registerWorkflow: jest.fn(),
  startWorkflow: jest.fn(),
  getWorkflowStatus: jest.fn(),
  cancelWorkflow: jest.fn()
};

const mockApiClient = {
  get: jest.fn(),
  post: jest.fn()
};

const mockStateManager = {
  getState: jest.fn(),
  setState: jest.fn()
};

const mockValidationEngine = {
  validateData: jest.fn()
};

const mockErrorHandler = {
  handleError: jest.fn()
};

describe('PermissionController', () => {
  let PermissionController;
  let permissionController;
  let dependencies;

  beforeAll(() => {
    // Require PermissionController after mocks are set up
    PermissionController = require('../../../src/middleware/controllers/PermissionController.js');
  });

  beforeEach(() => {
    dependencies = {
      workflowManager: mockWorkflowManager,
      apiClient: mockApiClient,
      stateManager: mockStateManager,
      validationEngine: mockValidationEngine,
      errorHandler: mockErrorHandler
    };

    permissionController = new PermissionController(dependencies);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockWorkflowManager.startWorkflow.mockResolvedValue('workflow-123');
    mockApiClient.get.mockResolvedValue({ permissions: {}, lastUpdated: '2023-01-01' });
    mockApiClient.post.mockResolvedValue({ permissions: {}, changeId: 'change-123' });
    mockStateManager.getState.mockReturnValue({ appPermissions: {} });
    mockStateManager.setState.mockResolvedValue();
    mockValidationEngine.validateData.mockResolvedValue({ isValid: true });
    mockErrorHandler.handleError.mockReturnValue({ code: 'ERROR', message: 'Test error' });
  });

  describe('Constructor', () => {
    test('should initialize with iOS permissions', () => {
      expect(permissionController.IOS_PERMISSIONS).toBeDefined();
      expect(permissionController.IOS_PERMISSIONS.CAMERA).toEqual({
        key: 'NSCameraUsageDescription',
        name: 'Camera',
        description: 'Access to device camera for photo and video capture',
        required: false,
        category: 'media'
      });
    });

    test('should initialize with Android permissions', () => {
      expect(permissionController.ANDROID_PERMISSIONS).toBeDefined();
      expect(permissionController.ANDROID_PERMISSIONS.CAMERA).toEqual({
        key: 'android.permission.CAMERA',
        name: 'Camera',
        description: 'Access to device camera for photo and video capture',
        required: false,
        category: 'media',
        dangerLevel: 'dangerous'
      });
    });

    test('should initialize with permission workflow steps', () => {
      expect(permissionController.PERMISSION_WORKFLOW_STEPS).toHaveLength(4);
      expect(permissionController.PERMISSION_WORKFLOW_STEPS[0].name).toBe('validate-permission-request');
      expect(permissionController.PERMISSION_WORKFLOW_STEPS[3].name).toBe('apply-permission-changes');
    });
  });

  describe('getRequiredDependencies', () => {
    test('should return correct required dependencies', () => {
      const required = permissionController.getRequiredDependencies();
      expect(required).toEqual([
        'workflowManager',
        'apiClient',
        'stateManager',
        'validationEngine',
        'errorHandler'
      ]);
    });
  });

  describe('setup', () => {
    test('should register permission management workflow', async () => {
      await permissionController.setup();

      expect(mockWorkflowManager.registerWorkflow).toHaveBeenCalledWith(
        'permission-management',
        permissionController.PERMISSION_WORKFLOW_STEPS,
        {
          allowParallel: false,
          maxRetries: 2,
          timeout: 30000
        }
      );

      expect(permissionController.emit).toHaveBeenCalledWith('permission-controller-initialized');
    });
  });

  describe('getAppPermissions', () => {
    test('should get iOS app permissions successfully', async () => {
      const mockPermissions = {
        CAMERA: { enabled: true, description: 'Camera access' }
      };
      mockApiClient.get.mockResolvedValue({
        permissions: mockPermissions,
        lastUpdated: '2023-01-01'
      });

      permissionController.normalizePermissions = jest.fn().mockReturnValue(mockPermissions);

      const result = await permissionController.getAppPermissions('app-123', 'ios');

      expect(result).toEqual({
        appId: 'app-123',
        platform: 'ios',
        permissions: mockPermissions,
        lastUpdated: '2023-01-01'
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/apps/app-123/permissions', {
        platform: 'ios'
      });

      expect(permissionController.emit).toHaveBeenCalledWith('permissions-retrieved', {
        appId: 'app-123',
        platform: 'ios',
        permissions: mockPermissions
      });
    });

    test('should handle invalid platform', async () => {
      await expect(permissionController.getAppPermissions('app-123', 'invalid'))
        .rejects.toThrow('Platform must be either "ios" or "android"');
    });

    test('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API error'));

      await expect(permissionController.getAppPermissions('app-123', 'ios'))
        .rejects.toThrow('API error');

      expect(permissionController.emit).toHaveBeenCalledWith('permissions-error', expect.any(Object));
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('updateAppPermissions', () => {
    const permissions = {
      CAMERA: { enabled: true, description: 'Camera access' }
    };

    test('should start permission update workflow', async () => {
      const workflowId = await permissionController.updateAppPermissions('app-123', 'ios', permissions);

      expect(workflowId).toBe('workflow-123');
      expect(mockWorkflowManager.startWorkflow).toHaveBeenCalledWith(
        'permission-management',
        expect.objectContaining({
          appId: 'app-123',
          platform: 'ios',
          permissions: permissions,
          operation: 'update'
        })
      );

      expect(permissionController.emit).toHaveBeenCalledWith('permission-update-started', {
        workflowId: 'workflow-123',
        appId: 'app-123',
        platform: 'ios',
        permissions: permissions
      });
    });

    test('should handle invalid platform', async () => {
      await expect(permissionController.updateAppPermissions('app-123', 'invalid', permissions))
        .rejects.toThrow('Platform must be either "ios" or "android"');
    });

    test('should handle workflow start errors', async () => {
      mockWorkflowManager.startWorkflow.mockRejectedValue(new Error('Workflow failed'));

      await expect(permissionController.updateAppPermissions('app-123', 'ios', permissions))
        .rejects.toThrow('Workflow failed');

      expect(permissionController.emit).toHaveBeenCalledWith('permission-update-error', expect.any(Object));
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('resetAppPermissions', () => {
    test('should start permission reset workflow', async () => {
      permissionController.getDefaultPermissions = jest.fn().mockReturnValue({
        INTERNET: { enabled: true }
      });

      const workflowId = await permissionController.resetAppPermissions('app-123', 'android');

      expect(workflowId).toBe('workflow-123');
      expect(mockWorkflowManager.startWorkflow).toHaveBeenCalledWith(
        'permission-management',
        expect.objectContaining({
          appId: 'app-123',
          platform: 'android',
          operation: 'reset'
        })
      );

      expect(permissionController.emit).toHaveBeenCalledWith('permission-reset-started', {
        workflowId: 'workflow-123',
        appId: 'app-123',
        platform: 'android'
      });
    });

    test('should handle reset errors', async () => {
      mockWorkflowManager.startWorkflow.mockRejectedValue(new Error('Reset failed'));
      permissionController.getDefaultPermissions = jest.fn().mockReturnValue({});

      await expect(permissionController.resetAppPermissions('app-123', 'android'))
        .rejects.toThrow('Reset failed');

      expect(permissionController.emit).toHaveBeenCalledWith('permission-reset-error', expect.any(Object));
      expect(mockErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('validatePermissionRequest', () => {
    test('should validate correct permission request', async () => {
      const context = {
        appId: 'app-123',
        platform: 'ios',
        permissions: {
          CAMERA: { enabled: true }
        }
      };

      const result = await permissionController.validatePermissionRequest(context, dependencies);

      expect(result.status).toBe('validation-passed');
      expect(result.validatedPermissions).toEqual(context.permissions);
    });

    test('should reject invalid app ID', async () => {
      const context = {
        appId: '',
        platform: 'ios',
        permissions: {}
      };

      await expect(permissionController.validatePermissionRequest(context, dependencies))
        .rejects.toThrow('Invalid app ID');
    });

    test('should reject invalid platform', async () => {
      const context = {
        appId: 'app-123',
        platform: 'invalid',
        permissions: {}
      };

      await expect(permissionController.validatePermissionRequest(context, dependencies))
        .rejects.toThrow('Platform must be either "ios" or "android"');
    });

    test('should reject invalid permissions', async () => {
      const context = {
        appId: 'app-123',
        platform: 'ios',
        permissions: {
          INVALID_PERMISSION: { enabled: true }
        }
      };

      await expect(permissionController.validatePermissionRequest(context, dependencies))
        .rejects.toThrow('Invalid permissions for ios: INVALID_PERMISSION');
    });
  });

  describe('analyzeCurrentPermissions', () => {
    beforeEach(() => {
      permissionController.getAppPermissions = jest.fn();
    });

    test('should analyze permission changes', async () => {
      const currentPermissions = {
        permissions: {
          CAMERA: { enabled: true, description: 'Old desc' }
        }
      };
      const context = {
        appId: 'app-123',
        platform: 'ios',
        permissions: {
          CAMERA: { enabled: true, description: 'New desc' },
          LOCATION: { enabled: true, description: 'Location' }
        }
      };

      permissionController.getAppPermissions.mockResolvedValue(currentPermissions);

      const result = await permissionController.analyzeCurrentPermissions(context, dependencies);

      expect(result.status).toBe('analysis-completed');
      expect(context.permissionAnalysis).toBeDefined();
      expect(context.permissionAnalysis.changes.added).toHaveLength(1);
      expect(context.permissionAnalysis.changes.modified).toHaveLength(1);
      expect(context.permissionAnalysis.changes.removed).toHaveLength(0);
    });
  });

  describe('preparePermissionChanges', () => {
    test('should prepare iOS permission changes', async () => {
      const context = {
        platform: 'ios',
        permissionAnalysis: {
          changes: {
            added: [
              { key: 'CAMERA', config: { enabled: true, description: 'Camera access' } }
            ],
            modified: [],
            removed: []
          }
        }
      };

      permissionController.prepareIOSPermissionChanges = jest.fn().mockReturnValue({
        NSCameraUsageDescription: 'Camera access'
      });
      permissionController.prepareIOSEntitlements = jest.fn().mockReturnValue({});

      const result = await permissionController.preparePermissionChanges(context, dependencies);

      expect(result.status).toBe('changes-prepared');
      expect(context.permissionChangeSet).toBeDefined();
      expect(context.permissionChangeSet.platform).toBe('ios');
    });

    test('should prepare Android permission changes', async () => {
      const context = {
        platform: 'android',
        permissionAnalysis: {
          changes: {
            added: [
              { key: 'CAMERA', config: { enabled: true } }
            ],
            modified: [],
            removed: []
          }
        }
      };

      permissionController.prepareAndroidPermissionChanges = jest.fn().mockReturnValue({
        permissions: ['android.permission.CAMERA']
      });

      const result = await permissionController.preparePermissionChanges(context, dependencies);

      expect(result.status).toBe('changes-prepared');
      expect(context.permissionChangeSet).toBeDefined();
      expect(context.permissionChangeSet.platform).toBe('android');
    });
  });

  describe('applyPermissionChanges', () => {
    test('should apply permission changes successfully', async () => {
      const context = {
        appId: 'app-123',
        platform: 'ios',
        permissions: { CAMERA: { enabled: true } },
        permissionChangeSet: { platform: 'ios', infoPlist: {} }
      };

      mockStateManager.getState.mockReturnValue({ appPermissions: {} });
      mockApiClient.post.mockResolvedValue({
        permissions: context.permissions,
        changeId: 'change-123'
      });

      const result = await permissionController.applyPermissionChanges(context, dependencies);

      expect(result.status).toBe('changes-applied');
      expect(result.changeId).toBe('change-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/apps/app-123/permissions', {
        platform: 'ios',
        changes: context.permissionChangeSet
      });

      expect(mockStateManager.setState).toHaveBeenCalledWith({
        appPermissions: {
          'app-123-ios': expect.objectContaining({
            permissions: context.permissions
          })
        }
      });
    });

    test('should handle API errors', async () => {
      const context = {
        appId: 'app-123',
        platform: 'ios',
        permissionChangeSet: { platform: 'ios' }
      };

      mockApiClient.post.mockRejectedValue(new Error('API error'));

      await expect(permissionController.applyPermissionChanges(context, dependencies))
        .rejects.toThrow('Failed to apply permission changes: API error');
    });
  });

  describe('prepareIOSPermissionChanges', () => {
    test('should prepare Info.plist changes', () => {
      const analysis = {
        changes: {
          added: [
            { key: 'CAMERA', config: { enabled: true, description: 'Custom camera desc' } }
          ],
          modified: [
            { key: 'LOCATION_WHEN_IN_USE', config: { enabled: true } }
          ]
        }
      };

      const result = permissionController.prepareIOSPermissionChanges(analysis);

      expect(result).toEqual({
        NSCameraUsageDescription: 'Custom camera desc',
        NSLocationWhenInUseUsageDescription: 'Access to location services while app is in use'
      });
    });
  });

  describe('prepareAndroidPermissionChanges', () => {
    test('should prepare manifest changes', () => {
      const analysis = {
        changes: {
          added: [
            { key: 'CAMERA', config: { enabled: true, required: true } },
            { key: 'INTERNET', config: { enabled: true } }
          ],
          modified: []
        }
      };

      const result = permissionController.prepareAndroidPermissionChanges(analysis);

      expect(result.permissions).toContainEqual({
        name: 'android.permission.CAMERA',
        required: true
      });

      expect(result.permissions).toContainEqual({
        name: 'android.permission.INTERNET',
        required: true
      });

      expect(result.features).toContainEqual({
        name: 'android.hardware.camera',
        required: true
      });
    });
  });

  describe('getDefaultPermissions', () => {
    test('should return default permissions for Android', () => {
      const defaults = permissionController.getDefaultPermissions('android');

      expect(defaults).toEqual({
        INTERNET: {
          enabled: true,
          required: true,
          description: 'Access to internet connectivity'
        },
        ACCESS_NETWORK_STATE: {
          enabled: true,
          required: false,
          description: 'Access to network connection information'
        }
      });
    });

    test('should return empty permissions for iOS', () => {
      const defaults = permissionController.getDefaultPermissions('ios');
      expect(defaults).toEqual({});
    });
  });

  describe('normalizePermissions', () => {
    test('should normalize permissions with available permission data', () => {
      const permissions = {
        CAMERA: { enabled: true, description: 'Camera access' }
      };

      const result = permissionController.normalizePermissions(permissions, 'ios');

      expect(result.CAMERA).toEqual({
        enabled: true,
        description: 'Camera access',
        name: 'Camera',
        category: 'media'
      });
    });
  });

  describe('validatePlatform', () => {
    test('should accept valid platforms', () => {
      expect(() => permissionController.validatePlatform('ios')).not.toThrow();
      expect(() => permissionController.validatePlatform('android')).not.toThrow();
      expect(() => permissionController.validatePlatform('iOS')).not.toThrow();
      expect(() => permissionController.validatePlatform('Android')).not.toThrow();
    });

    test('should reject invalid platforms', () => {
      expect(() => permissionController.validatePlatform('')).toThrow('Platform must be specified');
      expect(() => permissionController.validatePlatform(null)).toThrow('Platform must be specified');
      expect(() => permissionController.validatePlatform('windows')).toThrow('Platform must be either "ios" or "android"');
    });
  });

  describe('getAvailablePermissions', () => {
    test('should return iOS permissions', () => {
      const permissions = permissionController.getAvailablePermissions('ios');
      expect(permissions).toBe(permissionController.IOS_PERMISSIONS);
    });

    test('should return Android permissions', () => {
      const permissions = permissionController.getAvailablePermissions('android');
      expect(permissions).toBe(permissionController.ANDROID_PERMISSIONS);
    });
  });

  describe('getPermissionRecommendations', () => {
    test('should return recommendations for social apps', () => {
      const recommendations = permissionController.getPermissionRecommendations('social', 'ios');

      expect(recommendations.CAMERA).toBeDefined();
      expect(recommendations.PHOTO_LIBRARY).toBeDefined();
      expect(recommendations.CONTACTS).toBeDefined();
      expect(recommendations.PUSH_NOTIFICATIONS).toBeDefined();

      expect(recommendations.CAMERA.enabled).toBe(true);
      expect(recommendations.CAMERA.reason).toBe('Recommended for social apps');
    });

    test('should return recommendations for productivity apps', () => {
      const recommendations = permissionController.getPermissionRecommendations('productivity', 'android');

      expect(recommendations.ACCESS_NETWORK_STATE).toBeUndefined(); // Not in recommendation list
    });

    test('should return empty recommendations for unknown app type', () => {
      const recommendations = permissionController.getPermissionRecommendations('unknown', 'ios');
      expect(Object.keys(recommendations)).toHaveLength(0);
    });
  });

  describe('getWorkflowProgress', () => {
    test('should return workflow progress information', () => {
      const workflow = {
        steps: [
          { name: 'step1', description: 'First', status: 'completed' },
          { name: 'step2', description: 'Second', status: 'in-progress' }
        ],
        status: 'in-progress',
        currentStep: 1
      };
      mockWorkflowManager.getWorkflowStatus.mockReturnValue(workflow);

      const progress = permissionController.getWorkflowProgress('workflow-123');

      expect(progress).toEqual({
        workflowId: 'workflow-123',
        type: 'permission-management',
        status: 'in-progress',
        currentStep: 1,
        totalSteps: 2,
        completedSteps: 1,
        progress: 50,
        steps: [
          { name: 'step1', description: 'First', status: 'completed', error: undefined },
          { name: 'step2', description: 'Second', status: 'in-progress', error: undefined }
        ]
      });
    });

    test('should return null for non-existent workflow', () => {
      mockWorkflowManager.getWorkflowStatus.mockReturnValue(null);

      const progress = permissionController.getWorkflowProgress('non-existent');
      expect(progress).toBeNull();
    });
  });
});