

export const configuration = 
{
    "apps-settings": {
        "refresh-interval": 5*1000,
        "api-url": "",
        "release" : "0.1.0",
        "application-title": "DATop Monitoring Solution",
        "version-code-url" : "https://version.code.ds.wwcs.aws.dev/",
        "convert-Gbps-Bytesps" : 125000000,
        "refresh-interval-emr-cluster" : 5*1000
    },
    "colors": {
        "fonts" : {
            "metric102" : "#4595dd",
            "metric101" : "#e59400",
            "metric100" : "#e59400",
        },
        "lines" : {
            "separator100" : "#737c85",
            "separator101" : "#e7eaea",
            
        }
    }
    
};

export const SideMainLayoutHeader = { text: 'Amazon EMR', href: '/' };

export const SideMainLayoutMenu = [
    {
      text: 'EMR on EC2',
      type: 'section',
      defaultExpanded: true,
      items: [
          { type: "link", text: "Dashboard", href: "/dashboard/emr" },
          { type: "link", text: "Clusters", href: "/clusters/emr" },
      ],
    },
    { type: "divider" },
    { type: "link", text: "Settings", href: "#" },
    {
          type: "link",
          text: "Documentation",
          href: "https://github.com/snunezcode/db-workload-tool/",
          external: true,
          externalIconAriaLabel: "Opens in a new tab"
    },
     
  ];

export const breadCrumbs = [{text: 'Service',href: '#',},{text: 'Resource search',href: '#',},];



  