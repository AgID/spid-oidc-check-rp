export default {
  items: [
    {
      name: 'Metadata',
      icon: 'fa fa-tag',
      open: true,
      sessionRequired: false,
      children: [
        {
          name: 'Download',  
          url: '/metadata/download',   
          sessionRequired: false, 
        },
        {
          name: 'Check',  
          url: '/metadata/check',  
          sessionRequired: false
        },
      ]
    },
    {
      name: 'Auth Code Flow',  
      icon: 'fa fa-openid', 
      sessionRequired: true,
      children: [
        {
          name: 'Start Check',  
          url: '/oidc/check',      
        },
        {
          name: 'Report',  
          url: '/oidc/report',      
        },
        {
          name: 'Log',  
          url: '/oidc/log',      
        }
      ]
    },
    {
      name: 'Logout',
      icon: 'fa fa-sign-out',
      sessionRequired: false,
      url: '/logout'
    }
  ]
};
