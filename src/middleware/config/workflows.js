/**
 * Workflows Configuration
 *
 * Step definitions, dependencies, and progress tracking configurations
 * for all publishing workflows (iOS, Android, and Permission Management).
 */

/**
 * Workflow step types
 */
const STEP_TYPES = {
  VALIDATION: 'validation',
  API_CALL: 'api-call',
  FILE_OPERATION: 'file-operation',
  DATA_TRANSFORM: 'data-transform',
  USER_INTERACTION: 'user-interaction',
  SYSTEM_OPERATION: 'system-operation'
};

/**
 * Step execution modes
 */
const EXECUTION_MODES = {
  SEQUENTIAL: 'sequential',
  PARALLEL: 'parallel',
  CONDITIONAL: 'conditional'
};

/**
 * Progress tracking configuration
 */
const PROGRESS_CONFIG = {
  // Weight distribution for progress calculation
  STEP_WEIGHTS: {
    'validate-initial-data': 5,
    'setup-api-key': 15,
    'configure-bundle-id': 10,
    'generate-certificate': 20,
    'configure-store-settings': 10,
    'setup-metadata': 15,
    'configure-push-notifications': 5,
    'initialize-submission': 10,
    'start-build': 10,

    // Android steps
    'initialize-android-submission': 10,
    'configure-play-store-settings': 15,
    'setup-android-metadata': 15,
    'setup-keystore': 20,
    'configure-android-push-notifications': 5,
    'finalize-android-submission': 10,
    'start-android-build': 25,

    // Permission steps
    'validate-permission-request': 25,
    'analyze-current-permissions': 25,
    'prepare-permission-changes': 25,
    'apply-permission-changes': 25
  },

  // Progress thresholds for UI feedback
  THRESHOLDS: {
    STARTED: 0,
    QUARTER: 25,
    HALF: 50,
    THREE_QUARTERS: 75,
    COMPLETE: 100
  },

  // Milestone definitions
  MILESTONES: {
    IOS: [
      { step: 'setup-api-key', name: 'API Key Setup', progress: 15 },
      { step: 'generate-certificate', name: 'Certificate Generation', progress: 45 },
      { step: 'setup-metadata', name: 'Metadata Configuration', progress: 70 },
      { step: 'start-build', name: 'Build Started', progress: 100 }
    ],
    ANDROID: [
      { step: 'configure-play-store-settings', name: 'Play Store Setup', progress: 25 },
      { step: 'setup-keystore', name: 'Keystore Configuration', progress: 50 },
      { step: 'finalize-android-submission', name: 'Submission Ready', progress: 75 },
      { step: 'start-android-build', name: 'Build Started', progress: 100 }
    ],
    PERMISSIONS: [
      { step: 'validate-permission-request', name: 'Request Validated', progress: 25 },
      { step: 'analyze-current-permissions', name: 'Analysis Complete', progress: 50 },
      { step: 'prepare-permission-changes', name: 'Changes Prepared', progress: 75 },
      { step: 'apply-permission-changes', name: 'Changes Applied', progress: 100 }
    ]
  }
};

/**
 * iOS Publishing Workflow Definition
 */
const IOS_PUBLISHING_WORKFLOW = {
  id: 'ios-publishing',
  name: 'iOS Publishing Workflow',
  description: 'Complete workflow for publishing iOS applications to the App Store',
  platform: 'ios',
  version: '1.0.0',
  estimatedDuration: 300000, // 5 minutes in milliseconds

  steps: [
    {
      id: 'validate-initial-data',
      name: 'Validate Initial Data',
      description: 'Validate submission data and requirements',
      type: STEP_TYPES.VALIDATION,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: false,
      timeout: 10000,
      estimatedDuration: 5000,

      validation: {
        rules: ['appName', 'bundleId', 'appStoreTeamId'],
        customValidations: []
      },

      prerequisites: [],

      onSuccess: {
        nextSteps: ['setup-api-key'],
        events: ['data-validated'],
        stateUpdates: { validationComplete: true }
      },

      onFailure: {
        errorHandling: 'stop-workflow',
        events: ['validation-failed'],
        userActions: ['fix-validation-errors']
      }
    },

    {
      id: 'setup-api-key',
      name: 'Setup API Key',
      description: 'Setup or validate iOS API key for App Store Connect',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      maxRetries: 3,
      timeout: 30000,
      estimatedDuration: 15000,

      apiEndpoint: 'API_KEYS.LIST',
      fallbackEndpoints: ['API_KEYS.CREATE'],

      prerequisites: [
        { type: 'step', step: 'validate-initial-data', status: 'completed' },
        { type: 'context', path: 'appStoreTeamId', required: true }
      ],

      onSuccess: {
        nextSteps: ['configure-bundle-id'],
        events: ['api-key-ready'],
        stateUpdates: { apiKeyConfigured: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['api-key-failed'],
        userActions: ['check-team-id', 'verify-credentials']
      }
    },

    {
      id: 'configure-bundle-id',
      name: 'Configure Bundle ID',
      description: 'Configure bundle ID with required capabilities',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      maxRetries: 2,
      timeout: 30000,
      estimatedDuration: 12000,

      apiEndpoint: 'CERTIFICATES.GET_BUNDLE_IDS',
      fallbackEndpoints: ['CERTIFICATES.CREATE_BUNDLE_ID'],

      prerequisites: [
        { type: 'step', step: 'setup-api-key', status: 'completed' },
        { type: 'context', path: 'bundleId', required: true }
      ],

      onSuccess: {
        nextSteps: ['generate-certificate'],
        events: ['bundle-id-configured'],
        stateUpdates: { bundleIdReady: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['bundle-id-failed'],
        userActions: ['verify-bundle-id', 'check-existing-apps']
      }
    },

    {
      id: 'generate-certificate',
      name: 'Generate Certificate',
      description: 'Generate and configure iOS distribution certificates',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      maxRetries: 2,
      timeout: 60000,
      estimatedDuration: 30000,

      apiEndpoint: 'CERTIFICATES.CHECK',
      fallbackEndpoints: ['CERTIFICATES.GENERATE'],

      prerequisites: [
        { type: 'step', step: 'configure-bundle-id', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: ['configure-store-settings'],
        events: ['certificate-ready'],
        stateUpdates: { certificateConfigured: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['certificate-failed'],
        userActions: ['check-certificates', 'verify-provisioning']
      }
    },

    {
      id: 'configure-store-settings',
      name: 'Configure Store Settings',
      description: 'Configure App Store metadata and settings',
      type: STEP_TYPES.DATA_TRANSFORM,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 20000,
      estimatedDuration: 8000,

      prerequisites: [
        { type: 'step', step: 'setup-api-key', status: 'completed' }
      ],

      dataTransformations: [
        'normalize-store-config',
        'validate-store-rules',
        'apply-platform-defaults'
      ],

      onSuccess: {
        nextSteps: ['setup-metadata'],
        events: ['store-settings-configured'],
        stateUpdates: { storeConfigReady: true }
      },

      onFailure: {
        errorHandling: 'fail',
        events: ['store-settings-failed'],
        userActions: ['review-store-settings']
      }
    },

    {
      id: 'setup-metadata',
      name: 'Setup Metadata',
      description: 'Setup app metadata and upload assets',
      type: STEP_TYPES.FILE_OPERATION,
      executionMode: EXECUTION_MODES.PARALLEL,
      required: true,
      retryable: true,
      timeout: 120000, // Longer timeout for file uploads
      estimatedDuration: 45000,

      fileOperations: [
        { type: 'upload', target: 'app-icon', optional: true },
        { type: 'upload', target: 'screenshots', optional: true },
        { type: 'validate', target: 'metadata-completeness' }
      ],

      prerequisites: [
        { type: 'step', step: 'configure-store-settings', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: ['configure-push-notifications'],
        events: ['metadata-ready'],
        stateUpdates: { metadataConfigured: true }
      },

      onFailure: {
        errorHandling: 'retry-then-continue',
        events: ['metadata-failed'],
        userActions: ['check-file-formats', 'verify-metadata']
      }
    },

    {
      id: 'configure-push-notifications',
      name: 'Configure Push Notifications',
      description: 'Configure push notification settings',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: false,
      optional: true,
      retryable: true,
      timeout: 30000,
      estimatedDuration: 10000,

      apiEndpoint: 'PUSH_NOTIFICATIONS.CONFIGURE_IOS',

      prerequisites: [
        { type: 'step', step: 'generate-certificate', status: 'completed' }
      ],

      conditionalExecution: {
        condition: 'push-notifications-enabled',
        contextPath: 'submissionData.pushNotifications.enabled'
      },

      onSuccess: {
        nextSteps: ['initialize-submission'],
        events: ['push-notifications-configured'],
        stateUpdates: { pushNotificationsReady: true }
      },

      onFailure: {
        errorHandling: 'continue-with-warning',
        events: ['push-notifications-skipped'],
        userActions: ['review-push-settings']
      }
    },

    {
      id: 'initialize-submission',
      name: 'Initialize Submission',
      description: 'Initialize iOS submission process',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 30000,
      estimatedDuration: 12000,

      apiEndpoint: 'SUBMISSION.INITIALIZE',

      prerequisites: [
        { type: 'step', step: 'setup-metadata', status: 'completed' },
        { type: 'step', step: 'generate-certificate', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: ['start-build'],
        events: ['submission-initialized'],
        stateUpdates: { submissionReady: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['submission-initialization-failed'],
        userActions: ['review-configuration', 'contact-support']
      }
    },

    {
      id: 'start-build',
      name: 'Start Build',
      description: 'Start iOS build process',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: false,
      timeout: 30000,
      estimatedDuration: 15000,

      apiEndpoint: 'SUBMISSION.START_BUILD',

      prerequisites: [
        { type: 'step', step: 'initialize-submission', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: [],
        events: ['build-started'],
        stateUpdates: { buildInProgress: true },
        followUpActions: ['monitor-build-progress']
      },

      onFailure: {
        errorHandling: 'fail',
        events: ['build-start-failed'],
        userActions: ['review-build-settings', 'contact-support']
      }
    }
  ]
};

/**
 * Android Publishing Workflow Definition
 */
const ANDROID_PUBLISHING_WORKFLOW = {
  id: 'android-publishing',
  name: 'Android Publishing Workflow',
  description: 'Complete workflow for publishing Android applications to Google Play',
  platform: 'android',
  version: '1.0.0',
  estimatedDuration: 360000, // 6 minutes in milliseconds

  steps: [
    {
      id: 'validate-initial-data',
      name: 'Validate Initial Data',
      description: 'Validate submission data and requirements',
      type: STEP_TYPES.VALIDATION,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: false,
      timeout: 10000,
      estimatedDuration: 5000,

      validation: {
        rules: ['appName', 'packageName', 'playStoreServiceAccount'],
        customValidations: []
      },

      prerequisites: [],

      onSuccess: {
        nextSteps: ['initialize-android-submission'],
        events: ['data-validated'],
        stateUpdates: { validationComplete: true }
      },

      onFailure: {
        errorHandling: 'stop-workflow',
        events: ['validation-failed'],
        userActions: ['fix-validation-errors']
      }
    },

    {
      id: 'initialize-android-submission',
      name: 'Initialize Android Submission',
      description: 'Initialize Android submission process',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 30000,
      estimatedDuration: 15000,

      prerequisites: [
        { type: 'context', path: 'packageName', required: true },
        { type: 'context', path: 'playStoreServiceAccount', required: true }
      ],

      onSuccess: {
        nextSteps: ['configure-play-store-settings'],
        events: ['android-submission-initialized'],
        stateUpdates: { androidSubmissionReady: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['android-initialization-failed'],
        userActions: ['verify-play-console-access', 'check-service-account']
      }
    },

    {
      id: 'configure-play-store-settings',
      name: 'Configure Play Store Settings',
      description: 'Configure Google Play Store settings',
      type: STEP_TYPES.DATA_TRANSFORM,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 20000,
      estimatedDuration: 10000,

      prerequisites: [
        { type: 'step', step: 'initialize-android-submission', status: 'completed' }
      ],

      dataTransformations: [
        'normalize-play-store-config',
        'validate-android-rules',
        'apply-android-defaults'
      ],

      onSuccess: {
        nextSteps: ['setup-android-metadata'],
        events: ['play-store-configured'],
        stateUpdates: { playStoreConfigReady: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['play-store-config-failed'],
        userActions: ['review-play-store-settings']
      }
    },

    {
      id: 'setup-android-metadata',
      name: 'Setup Android Metadata',
      description: 'Setup app metadata and upload assets for Play Store',
      type: STEP_TYPES.FILE_OPERATION,
      executionMode: EXECUTION_MODES.PARALLEL,
      required: true,
      retryable: true,
      timeout: 120000,
      estimatedDuration: 40000,

      fileOperations: [
        { type: 'upload', target: 'app-icon', optional: true },
        { type: 'upload', target: 'feature-graphic', optional: true },
        { type: 'upload', target: 'screenshots', optional: true },
        { type: 'validate', target: 'android-metadata-completeness' }
      ],

      prerequisites: [
        { type: 'step', step: 'configure-play-store-settings', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: ['setup-keystore'],
        events: ['android-metadata-ready'],
        stateUpdates: { androidMetadataConfigured: true }
      },

      onFailure: {
        errorHandling: 'retry-then-continue',
        events: ['android-metadata-failed'],
        userActions: ['check-android-assets', 'verify-metadata']
      }
    },

    {
      id: 'setup-keystore',
      name: 'Setup Keystore',
      description: 'Setup or upload Android keystore',
      type: STEP_TYPES.FILE_OPERATION,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 60000,
      estimatedDuration: 25000,

      fileOperations: [
        { type: 'upload-or-generate', target: 'keystore' },
        { type: 'validate', target: 'keystore-credentials' }
      ],

      prerequisites: [
        { type: 'step', step: 'setup-android-metadata', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: ['configure-android-push-notifications'],
        events: ['keystore-ready'],
        stateUpdates: { keystoreConfigured: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['keystore-setup-failed'],
        userActions: ['verify-keystore-file', 'check-keystore-passwords']
      }
    },

    {
      id: 'configure-android-push-notifications',
      name: 'Configure Android Push Notifications',
      description: 'Configure Firebase push notification settings',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: false,
      optional: true,
      retryable: true,
      timeout: 30000,
      estimatedDuration: 12000,

      apiEndpoint: 'PUSH_NOTIFICATIONS.CONFIGURE_ANDROID',

      prerequisites: [
        { type: 'step', step: 'setup-keystore', status: 'completed' }
      ],

      conditionalExecution: {
        condition: 'push-notifications-enabled',
        contextPath: 'submissionData.pushNotifications.enabled'
      },

      onSuccess: {
        nextSteps: ['finalize-android-submission'],
        events: ['android-push-configured'],
        stateUpdates: { androidPushReady: true }
      },

      onFailure: {
        errorHandling: 'continue-with-warning',
        events: ['android-push-skipped'],
        userActions: ['check-firebase-config', 'verify-google-services']
      }
    },

    {
      id: 'finalize-android-submission',
      name: 'Finalize Android Submission',
      description: 'Finalize submission configuration',
      type: STEP_TYPES.DATA_TRANSFORM,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 20000,
      estimatedDuration: 10000,

      prerequisites: [
        { type: 'step', step: 'setup-keystore', status: 'completed' }
      ],

      dataTransformations: [
        'compile-android-config',
        'validate-final-submission',
        'prepare-build-config'
      ],

      onSuccess: {
        nextSteps: ['start-android-build'],
        events: ['android-submission-finalized'],
        stateUpdates: { androidSubmissionComplete: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['android-finalization-failed'],
        userActions: ['review-android-config', 'check-requirements']
      }
    },

    {
      id: 'start-android-build',
      name: 'Start Android Build',
      description: 'Start Android build process',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: false,
      timeout: 30000,
      estimatedDuration: 20000,

      apiEndpoint: 'SUBMISSION.START_BUILD',

      prerequisites: [
        { type: 'step', step: 'finalize-android-submission', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: [],
        events: ['android-build-started'],
        stateUpdates: { androidBuildInProgress: true },
        followUpActions: ['monitor-android-build-progress']
      },

      onFailure: {
        errorHandling: 'fail',
        events: ['android-build-start-failed'],
        userActions: ['review-build-config', 'contact-support']
      }
    }
  ]
};

/**
 * Permission Management Workflow Definition
 */
const PERMISSION_MANAGEMENT_WORKFLOW = {
  id: 'permission-management',
  name: 'Permission Management Workflow',
  description: 'Workflow for managing native app permissions',
  platform: 'cross-platform',
  version: '1.0.0',
  estimatedDuration: 60000, // 1 minute in milliseconds

  steps: [
    {
      id: 'validate-permission-request',
      name: 'Validate Permission Request',
      description: 'Validate permission update request',
      type: STEP_TYPES.VALIDATION,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: false,
      timeout: 10000,
      estimatedDuration: 5000,

      validation: {
        rules: ['app-id', 'platform', 'permissions'],
        customValidations: ['validate-permission-format', 'check-platform-compatibility']
      },

      prerequisites: [],

      onSuccess: {
        nextSteps: ['analyze-current-permissions'],
        events: ['permission-request-validated'],
        stateUpdates: { permissionRequestValid: true }
      },

      onFailure: {
        errorHandling: 'stop-workflow',
        events: ['permission-validation-failed'],
        userActions: ['fix-permission-request']
      }
    },

    {
      id: 'analyze-current-permissions',
      name: 'Analyze Current Permissions',
      description: 'Analyze current app permissions',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 15000,
      estimatedDuration: 8000,

      apiEndpoint: 'PERMISSIONS.GET_APP_PERMISSIONS',

      prerequisites: [
        { type: 'step', step: 'validate-permission-request', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: ['prepare-permission-changes'],
        events: ['permissions-analyzed'],
        stateUpdates: { permissionAnalysisComplete: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['permission-analysis-failed'],
        userActions: ['verify-app-access', 'check-app-id']
      }
    },

    {
      id: 'prepare-permission-changes',
      name: 'Prepare Permission Changes',
      description: 'Prepare permission configuration changes',
      type: STEP_TYPES.DATA_TRANSFORM,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 10000,
      estimatedDuration: 5000,

      dataTransformations: [
        'calculate-permission-diff',
        'prepare-platform-configs',
        'validate-permission-compatibility'
      ],

      prerequisites: [
        { type: 'step', step: 'analyze-current-permissions', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: ['apply-permission-changes'],
        events: ['permission-changes-prepared'],
        stateUpdates: { permissionChangesReady: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['permission-preparation-failed'],
        userActions: ['review-permission-changes']
      }
    },

    {
      id: 'apply-permission-changes',
      name: 'Apply Permission Changes',
      description: 'Apply permission changes to app configuration',
      type: STEP_TYPES.API_CALL,
      executionMode: EXECUTION_MODES.SEQUENTIAL,
      required: true,
      retryable: true,
      timeout: 30000,
      estimatedDuration: 12000,

      apiEndpoint: 'PERMISSIONS.UPDATE_APP_PERMISSIONS',

      prerequisites: [
        { type: 'step', step: 'prepare-permission-changes', status: 'completed' }
      ],

      onSuccess: {
        nextSteps: [],
        events: ['permissions-applied'],
        stateUpdates: { permissionsUpdated: true }
      },

      onFailure: {
        errorHandling: 'retry-then-fail',
        events: ['permission-apply-failed'],
        userActions: ['review-permission-conflicts', 'verify-app-access']
      }
    }
  ]
};

/**
 * All workflow definitions
 */
const WORKFLOWS = {
  'ios-publishing': IOS_PUBLISHING_WORKFLOW,
  'android-publishing': ANDROID_PUBLISHING_WORKFLOW,
  'permission-management': PERMISSION_MANAGEMENT_WORKFLOW
};

/**
 * Get workflow definition by ID
 * @param {string} workflowId - Workflow identifier
 * @returns {Object|null} Workflow definition or null if not found
 */
function getWorkflow(workflowId) {
  return WORKFLOWS[workflowId] || null;
}

/**
 * Get all available workflows
 * @returns {Object} All workflow definitions
 */
function getAllWorkflows() {
  return { ...WORKFLOWS };
}

/**
 * Get workflows by platform
 * @param {string} platform - Platform filter ('ios', 'android', 'cross-platform')
 * @returns {Object} Filtered workflow definitions
 */
function getWorkflowsByPlatform(platform) {
  const filtered = {};

  Object.entries(WORKFLOWS).forEach(([id, workflow]) => {
    if (workflow.platform === platform) {
      filtered[id] = workflow;
    }
  });

  return filtered;
}

/**
 * Calculate workflow progress
 * @param {Object} workflow - Workflow instance
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(workflow) {
  if (!workflow || !workflow.steps) {
    return 0;
  }

  let totalWeight = 0;
  let completedWeight = 0;

  workflow.steps.forEach(step => {
    const weight = PROGRESS_CONFIG.STEP_WEIGHTS[step.id] || 10; // Default weight
    totalWeight += weight;

    if (step.status === 'completed') {
      completedWeight += weight;
    } else if (step.status === 'in-progress') {
      completedWeight += weight * 0.5; // Half credit for in-progress
    }
  });

  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
}

/**
 * Get next milestone for workflow
 * @param {Object} workflow - Workflow instance
 * @returns {Object|null} Next milestone or null if none
 */
function getNextMilestone(workflow) {
  if (!workflow || !workflow.platform) {
    return null;
  }

  const platformMilestones = PROGRESS_CONFIG.MILESTONES[workflow.platform.toUpperCase()];
  if (!platformMilestones) {
    return null;
  }

  const currentProgress = calculateProgress(workflow);

  return platformMilestones.find(milestone =>
    milestone.progress > currentProgress
  ) || null;
}

/**
 * Get completed milestones for workflow
 * @param {Object} workflow - Workflow instance
 * @returns {Array} Completed milestones
 */
function getCompletedMilestones(workflow) {
  if (!workflow || !workflow.platform) {
    return [];
  }

  const platformMilestones = PROGRESS_CONFIG.MILESTONES[workflow.platform.toUpperCase()];
  if (!platformMilestones) {
    return [];
  }

  const currentProgress = calculateProgress(workflow);

  return platformMilestones.filter(milestone =>
    milestone.progress <= currentProgress
  );
}

/**
 * Validate workflow definition
 * @param {Object} workflow - Workflow definition to validate
 * @returns {Object} Validation result
 */
function validateWorkflowDefinition(workflow) {
  const errors = [];

  if (!workflow.id) {
    errors.push('Workflow must have an ID');
  }

  if (!workflow.name) {
    errors.push('Workflow must have a name');
  }

  if (!workflow.steps || !Array.isArray(workflow.steps)) {
    errors.push('Workflow must have steps array');
  } else {
    workflow.steps.forEach((step, index) => {
      if (!step.id) {
        errors.push(`Step ${index} must have an ID`);
      }

      if (!step.name) {
        errors.push(`Step ${index} must have a name`);
      }

      if (!step.type || !Object.values(STEP_TYPES).includes(step.type)) {
        errors.push(`Step ${index} must have a valid type`);
      }

      if (!step.executionMode || !Object.values(EXECUTION_MODES).includes(step.executionMode)) {
        errors.push(`Step ${index} must have a valid execution mode`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get step by ID from workflow
 * @param {Object} workflow - Workflow definition
 * @param {string} stepId - Step identifier
 * @returns {Object|null} Step definition or null if not found
 */
function getStep(workflow, stepId) {
  if (!workflow || !workflow.steps) {
    return null;
  }

  return workflow.steps.find(step => step.id === stepId) || null;
}

/**
 * Get estimated workflow duration
 * @param {string} workflowId - Workflow identifier
 * @returns {number} Estimated duration in milliseconds
 */
function getEstimatedDuration(workflowId) {
  const workflow = getWorkflow(workflowId);
  return workflow ? workflow.estimatedDuration : 0;
}

// Export for use in other middleware components
if (typeof window !== 'undefined') {
  window.WorkflowsConfig = {
    STEP_TYPES,
    EXECUTION_MODES,
    PROGRESS_CONFIG,
    WORKFLOWS,
    getWorkflow,
    getAllWorkflows,
    getWorkflowsByPlatform,
    calculateProgress,
    getNextMilestone,
    getCompletedMilestones,
    validateWorkflowDefinition,
    getStep,
    getEstimatedDuration
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STEP_TYPES,
    EXECUTION_MODES,
    PROGRESS_CONFIG,
    WORKFLOWS,
    getWorkflow,
    getAllWorkflows,
    getWorkflowsByPlatform,
    calculateProgress,
    getNextMilestone,
    getCompletedMilestones,
    validateWorkflowDefinition,
    getStep,
    getEstimatedDuration
  };
}