import { createApp } from 'vue';
import { reactive } from 'vue';
import IOSLanding from './components/IOSLanding.vue';
import AndroidLanding from './components/AndroidLanding.vue';
import AndroidStepper from './components/AndroidStepper.vue';

// Create a simple router component
const PublishingDashboard = {
  name: 'PublishingDashboard',
  components: {
    IOSLanding,
    AndroidLanding,
    AndroidStepper
  },
  data() {
    return {
      currentView: 'ios-landing', // 'ios-landing' | 'android-landing' | 'android-stepper'
      navigationData: null, // Pass data between views (e.g., resume data)
      appId: null
    };
  },
  created() {
    // Get app ID from Fliplet environment or other source
    this.appId = window.Fliplet?.Env?.get('appId') || null;
    
    // Check URL for initial view (optional)
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    if (view === 'android') {
      this.currentView = 'android-landing';
    }
  },
  methods: {
    handleNavigation(destination, data = null) {
      this.navigationData = data;
      
      switch (destination) {
        case 'ios':
        case 'ios-landing':
          this.currentView = 'ios-landing';
          break;
        case 'android':
        case 'android-landing':
          this.currentView = 'android-landing';
          break;
        case 'android-stepper':
          this.currentView = 'android-stepper';
          break;
        case 'dashboard':
          // Navigate to main dashboard (handle as needed)
          console.log('Navigate to dashboard');
          break;
        default:
          console.warn('Unknown navigation destination:', destination);
      }
    }
  },
  template: `
    <div id="publishing-dashboard-root">
      <IOSLanding 
        v-if="currentView === 'ios-landing'"
        @navigate="handleNavigation"
      />
      <AndroidLanding 
        v-else-if="currentView === 'android-landing'"
        @navigate="handleNavigation"
      />
      <AndroidStepper 
        v-else-if="currentView === 'android-stepper'"
        :resume-data="navigationData?.submission"
        :is-new-build="navigationData?.newBuild || false"
        @navigate="handleNavigation"
      />
    </div>
  `
};

const app = createApp(PublishingDashboard);

// Make appId available globally for child components
app.config.globalProperties.$appId = window.Fliplet?.Env?.get('appId') || null;

app.mount('#publishing-dashboard');





