// Interface configuration for Publishing Dashboard widget
Fliplet.Widget.generateInterface({
  title: 'Publishing Dashboard Settings',
  fields: [
    {
      name: 'enableIOS',
      type: 'checkbox',
      label: 'Enable iOS Publishing',
      default: true,
      description: 'Allow users to publish to iOS App Store'
    },
    {
      name: 'enableAndroid',
      type: 'checkbox', 
      label: 'Enable Android Publishing',
      default: true,
      description: 'Allow users to publish to Google Play Store'
    },
    {
      name: 'requireAdmin',
      type: 'checkbox',
      label: 'Require Admin Access',
      default: false,
      description: 'Only allow admin users to access the publishing dashboard'
    }
  ]
});