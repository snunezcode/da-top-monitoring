import {useState,useEffect,useRef} from 'react'
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu } from './Configs';
import { useSearchParams } from 'react-router-dom';

import { applicationVersionUpdate } from '../components/Functions';
import { createLabelFunction, customFormatNumberLong, customFormatNumber, customFormatDateDifference, formatDateLong, customDateDifferenceMinutes } from '../components/Functions';

import Flashbar from "@cloudscape-design/components/flashbar";
import ContentLayout from '@cloudscape-design/components/content-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Header from "@cloudscape-design/components/header";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Spinner from "@cloudscape-design/components/spinner";
import { SplitPanel } from '@cloudscape-design/components';
import AppLayout from '@cloudscape-design/components/app-layout';
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import CustomHeader from "../components/Header";
import Tabs from "@cloudscape-design/components/tabs";
import Button from "@cloudscape-design/components/button";
import Multiselect from "@cloudscape-design/components/multiselect";
import ExpandableSection from "@cloudscape-design/components/expandable-section";


import CompMetric01  from '../components/Metric01';
import ChartLine04  from '../components/ChartLine04';
import ChartDots01  from '../components/ChartDots01';
import ChartRangeArea01  from '../components/ChartRangeArea01';
import CustomTable02 from "../components/Table02";
import ChartRadialBar01 from '../components/ChartRadialBar01';
import ChartPie01 from '../components/ChartPie-01';
import ChartColumn01  from '../components/ChartColumn01';
import DateTimePicker01 from "../components/DateTimePicker01";
import ChartTimeLine01  from '../components/ChartTimeLine01';
import ChartProgressBar01 from '../components/ChartProgressBar-01';


import '@aws-amplify/ui-react/styles.css';

export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  preferencesTitle: 'Split panel preferences',
  preferencesPositionLabel: 'Split panel position',
  preferencesPositionDescription: 'Choose the default split panel position for the service.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  resizeHandleAriaLabel: 'Resize split panel',
};


var CryptoJS = require("crypto-js");

function Application() {

    //-- Application Version
    const [versionMessage, setVersionMessage] = useState([]);

    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
  
    //-- Gather Parameters
    /*
    const [params]=useSearchParams();
    const parameter_id=params.get("id");  
    var parameter_object_bytes = CryptoJS.AES.decrypt(parameter_id, sessionStorage.getItem("x-token-cognito"));
    var parameter_object_values = JSON.parse(parameter_object_bytes.toString(CryptoJS.enc.Utf8));
    */
    
    //-- Variable for Active Tabs
    const [activeSubTabId, setActiveSubTabId] = useState("tab02-01");
    const currentSubTabId = useRef("tab02-01");
    
    
    //-- Split Panel
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [splitPanelSize, setSplitPanelSize] = useState(400);
    const splitPanelState = useRef(false);
    
    //-- Node Identfied
    const currentInstanceIdentifier = useRef("");
    
    //-- Table Nodes
    const columnsTableNodes =  [
                  {id: 'instance_id', header: 'InstanceId',cell: item => item['instance_id'],ariaLabel: createLabelFunction('instance_id'),sortingField: 'instance_id',},
                  {id: 'cluster_id', header: 'ClusterId',cell: item => item['cluster_id'],ariaLabel: createLabelFunction('cluster_id'),sortingField: 'cluster_id',},
                  {id: 'group_id', header: 'GroupId',cell: item => item['group_id'],ariaLabel: createLabelFunction('group_id'),sortingField: 'group_id',},
                  {id: 'role', header: 'Role',cell: item => item['role'],ariaLabel: createLabelFunction('role'),sortingField: 'role',},
                  {id: 'market_type', header: 'Mode',cell: item => item['market_type'],ariaLabel: createLabelFunction('market_type'),sortingField: 'market_type',},
                  {id: 'az', header: 'AZ',cell: item => item['az'],ariaLabel: createLabelFunction('az'),sortingField: 'az',},
                  {id: 'private_ip', header: 'PrivateIP',cell: item => item['private_ip'],ariaLabel: createLabelFunction('private_ip'),sortingField: 'private_ip',},
                  {id: 'instance_type', header: 'InstanceType',cell: item => item['instance_type'],ariaLabel: createLabelFunction('instance_type'),sortingField: 'instance_type',},
                  {id: 'total_vcpu',header: 'vCPUs',cell: item => customFormatNumberLong(parseFloat(item['total_vcpu']),0),ariaLabel: createLabelFunction('total_vcpu'),sortingField: 'total_vcpu', },
                  {id: 'total_memory',header: 'Memory',cell: item => customFormatNumber(parseFloat(item['total_memory']),2),ariaLabel: createLabelFunction('total_memory'),sortingField: 'total_memory', },
                  {id: 'cpu_usage',header: 'CPU(%)',cell: item => customFormatNumberLong(parseFloat(item['cpu_usage']),2),ariaLabel: createLabelFunction('cpu_usage'),sortingField: 'cpu_usage', },
                  {id: 'memory_usage',header: 'Memory(%)',cell: item => customFormatNumberLong(parseFloat(item['memory_usage']),2),ariaLabel: createLabelFunction('memory_usage'),sortingField: 'memory_usage', },
                  {id: 'total_disk_bytes',header: 'DiskBytes',cell: item => customFormatNumberLong(parseFloat(item['total_disk_bytes']),2),ariaLabel: createLabelFunction('total_disk_bytes'),sortingField: 'total_disk_bytes', },
                  {id: 'read_bytes',header: 'IOReadBytes',cell: item => customFormatNumberLong(parseFloat(item['read_bytes']),2),ariaLabel: createLabelFunction('read_bytes'),sortingField: 'read_bytes', },
                  {id: 'write_bytes',header: 'IOWriteBytes',cell: item => customFormatNumberLong(parseFloat(item['write_bytes']),2) ,ariaLabel: createLabelFunction('write_bytes'),sortingField: 'write_bytes', },
                  {id: 'total_iops',header: 'IOPS',cell: item => customFormatNumberLong(parseFloat(item['total_iops']),2),ariaLabel: createLabelFunction('total_iops'),sortingField: 'total_iops', },
                  {id: 'io_reads',header: 'IOPSReads',cell: item => customFormatNumberLong(parseFloat(item['io_reads']),2),ariaLabel: createLabelFunction('io_reads'),sortingField: 'io_reads', },
                  {id: 'io_writes',header: 'IOPSWrites',cell: item => customFormatNumberLong(parseFloat(item['io_writes']),2) ,ariaLabel: createLabelFunction('io_writes'),sortingField: 'io_writes', },
                  {id: 'total_network_bytes',header: 'NetworkBytes',cell: item => customFormatNumberLong(parseFloat(item['total_network_bytes']),2) ,ariaLabel: createLabelFunction('total_network_bytes'),sortingField: 'total_network_bytes', },
                  {id: 'sent_bytes',header: 'NetBytesSent',cell: item => customFormatNumberLong(parseFloat(item['sent_bytes']),2) ,ariaLabel: createLabelFunction('sent_bytes'),sortingField: 'sent_bytes', },
                  {id: 'recv_bytes',header: 'NetBytesRecv',cell: item => customFormatNumberLong(parseFloat(item['recv_bytes']),2),ariaLabel: createLabelFunction('recv_bytes'),sortingField: 'recv_bytes',},
    ];
    
    const visibleContentNodes = ['instance_id','cluster_id', 'group_id', 'role', 'instance_type', 'market_type', 'az', 'total_vcpu','total_memory', 'cpu_usage', 'memory_usage', 'total_disk_bytes', 'total_iops', 'total_network_bytes'];
    
    
    

    const [globalStats,setGlobalStats] = useState({
                                                        totalClusters   : 0,
                                                        totalCPUs       : 0,
                                                        totalMemory     : 0,
                                                        totalNodes      : 0,
                                                        cpuUsage        : { avg : 0, p10 : 0, p50 : 0, p90 : 0 },
                                                        memoryUsage     : { avg : 0, p10 : 0, p50 : 0, p90 : 0 },
                                                        charts : {
                                                            clusters        : [],
                                                            cores           : [],
                                                            cpus            : [],
                                                            memory          : [],
                                                            jobsRunning     : [],
                                                            clusterLifeCycle : [],
                                                            cpuUsage        : { p10 : [], p50 : [], p90 : [] } ,
                                                            memoryUsage     : { p10 : [], p50 : [], p90 : [] } ,
                                                            coresUsage      : { p10 : [], p50 : [], p90 : [] } ,
                                                            roles           : { categories : [], series : [] },
                                                            instanceType    : { categories : [], series : [] },
                                                            instanceMarket  : { categories : [], series : [] }, 
                                                            globalInstanceType : [],
                                                            globalInstanceMarket : [],
                                                            globalInstanceRole : [],
                                                        }
        });
    
    
    var dateFilter = useRef({ type: "absolute", "startDate" : new Date((new Date).getTime() - 24 * 60 * 60 * 1000).toISOString(),  "endDate" : new Date().toISOString() });
    //{ type: "absolute", startDate: "2018-01-09T12:34:56",endDate: "2018-01-19T15:30:00" } 
    
    const [selectedOptions,setSelectedOptions] = useState([
                                                            { label: "Cluster LifeCycle", value: "1"},
                                                    { label: "Clusters Running", value: "2"},
                                                    { label: "Cores Total", value: "3"},
                                                    { label: "Cores Usage(%)", value: "4"},
                                                    { label: "CPU Usage(%)", value: "5"},
                                                    { label: "Instances by Class", value: "6"},
                                                    { label: "Instances by Market", value: "7"},
                                                    { label: "Instances by Role", value: "8"},
                                                    { label: "Jobs Running", value: "9"},
                                                    { label: "Memory Total(GB)", value: "10"},
                                                    { label: "Memory Usage(%)", value: "11"},
    ]);
    
    //-- Function Gather Cluster Stats
    async function gatherGlobalStats() {
        
            Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
            var api_url = configuration["apps-settings"]["api-url"];
            var startDate = (dateFilter.current['startDate'].substring(0,19)).replace("T", " ");
            var endDate = (dateFilter.current['endDate'].substring(0,19)).replace("T", " ");
            var periodHours = customDateDifferenceMinutes(startDate,endDate) / 60 ;
            var period = "";
            
            switch (true) {
                
                case (periodHours < 24 ):
                    period = "5m";
                    break;
                    
                case (periodHours < ( 24 * 3)):
                    period = "10m";
                    break;
                    
                case (periodHours < ( 24 * 7)):
                    period = "60m";
                    break;
                    
                case (periodHours < ( 24 * 14)):
                    period = "360m";
                    break;
                    
                case (periodHours < ( 24 * 21)):
                    period = "720m";
                    break;
                    
                case (periodHours < ( 24 * 28)):
                    period = "1d";
                    break;
                    
                default:
                    period = "3d";
                    break;
            }
            
            console.log(periodHours,period);
            var params = {
                period : period,
                startDate : " timestamp '" + startDate + "'",
                endDate : "timestamp '" + endDate + "'"
            };
            
            
            await Axios.get(`${api_url}/api/aws/emr/cluster/gather/global/metrics`,{
                      params: params, 
                  }).then((data)=>{
                      console.log(data);
                      setGlobalStats(data.data); 
            })
            .catch((err) => {
                      console.log('Timeout API Call : /api/aws/emr/cluster/gather/global/metrics' );
                      console.log(err);
                      
            });
          
    
    }
    
    
    
    
    //-- Function Gather Cluster Information
    async function gatherClusterInformation() {
    
        await gatherGlobalStats();
        
        
        
    }
    
    //-- Function Gather App Version
   async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbwcmp", moduleId: "elastic-m1"} );
        
        if (appVersionObject.release > configuration["apps-settings"]["release"] ){
          setVersionMessage([
                              {
                                type: "info",
                                content: "New Application version is available, new features and modules will improve workload capabilities and user experience.",
                                dismissible: true,
                                dismissLabel: "Dismiss message",
                                onDismiss: () => setVersionMessage([]),
                                id: "message_1"
                              }
          ]);
      
        }
        
   }
   
   
   useEffect(() => {
        gatherGlobalStats();
        //const id = setInterval(gatherClusterInformation, configuration["apps-settings"]["refresh-interval-emr-cluster"]);
        //return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
    function chartSelected(element,arr) {
          return arr.some(function(el) {
            return el.label === element;
          }); 
    }
    
   
    
  return (
    <div>
      <CustomHeader/>
      <AppLayout
            disableContentPaddings
            navigation={<SideNavigation activeHref={"/dashboard/emr"} items={SideMainLayoutMenu} header={SideMainLayoutHeader} />}
            toolsHide
            contentType="default"
            content={
                    
                <div style={{"padding" : "1em" }}>
                    <div>
                            <Container
                                
                                header={
                                        <Header
                                          variant="h2"
                                          actions={
                                            <SpaceBetween
                                              direction="horizontal"
                                              size="xs"
                                            >
                                                
                                                <DateTimePicker01
                                                      value={dateFilter.current}
                                                      onChangeDateSelection={(detail) => {
                                                                dateFilter.current = detail;
                                                                gatherGlobalStats();
                                                      }
                                                      }
                                                />
                                                <Button variant="primary"
                                                        onClick={() => {
                                                                            gatherGlobalStats();
                                                                        }
                                                        }
                                                >Refresh</Button>
                                            </SpaceBetween>
                                          }
                                        >
                                          EMR Dasboard
                                        </Header>
                                      }
                            >
                                <table style={{"width":"100%", "padding": "1em"}}>
                                    <tr>  
                                        <td style={{ "width":"25%", "text-align" : "center"}}>
                                            <CompMetric01 
                                                value={globalStats['totalClusters']|| 0}
                                                title={"TotalClusters"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"32px"}
                                            />
                                        </td>
                                        <td style={{ "width":"25%", "text-align" : "center"}}>
                                            <CompMetric01 
                                                value={globalStats['totalNodes']|| 0}
                                                title={"TotalNodes"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"32px"}
                                            />
                                        </td>
                                        <td style={{ "width":"25%", "text-align" : "center"}}>
                                            <CompMetric01 
                                                value={globalStats['totalCPUs']|| 0}
                                                title={"TotalVCPUs"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"32px"}
                                            />
                                        </td>
                                        <td style={{ "width":"25%", "text-align" : "center"}}>
                                            <CompMetric01 
                                                value={globalStats['totalMemory']|| 0}
                                                title={"TotalMemory(GB)"}
                                                precision={0}
                                                format={3}
                                                fontColorValue={configuration.colors.fonts.metric100}
                                                fontSizeValue={"32px"}
                                            />
                                        </td>
                                    </tr>
                                </table>
                                <br/>
                                <table style={{"width":"100%", "padding": "1em"}}>
                                    <tr>
                                        <td valign="top" style={{ "width":"15%", "text-align" : "center"}}>
                                            <ChartPie01 
                                                    title={"Instances by Type"} 
                                                    height="300px" 
                                                    width="100%" 
                                                    dataset = { JSON.stringify(globalStats['charts']?.['globalInstanceType']) }
                                            />
                                            
                                        </td>
                                        <td valign="top" style={{ "width":"15%", "text-align" : "center"}}>
                                            <ChartPie01 
                                                    title={"Instances by Market"} 
                                                    height="300px" 
                                                    width="100%" 
                                                    dataset = { JSON.stringify(globalStats['charts']?.['globalInstanceMarket']) }
                                            />
                                            
                                        </td>
                                        <td valign="top" style={{ "width":"15%", "text-align" : "center"}}>
                                            <ChartPie01 
                                                    title={"Instances by Role"} 
                                                    height="300px" 
                                                    width="100%" 
                                                    dataset = { JSON.stringify(globalStats['charts']?.['globalInstanceRole']) }
                                            />
                                            
                                        </td>
                                        <td style={{ "width":"25%", "text-align" : "center"}}>
                                            
                                            <Box variant="h2">CPU Usage</Box>
                                            <table style={{"width":"100%", "padding": "1em"}}>
                                                <tr>  
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['cpuUsage']?.['avg']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"avg"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['cpuUsage']?.['p10']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"p10"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['cpuUsage']?.['p50']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"p50"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['cpuUsage']?.['p90']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"p90"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                        
                                        <td style={{ "width":"25%", "text-align" : "center"}}>
                                            <Box variant="h2">Memory Usage</Box>
                                            <table style={{"width":"100%", "padding": "1em"}}>
                                                <tr>  
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['memoryUsage']?.['avg']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"avg"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['memoryUsage']?.['p10']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"p10"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['memoryUsage']?.['p50']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"p50"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                    <td style={{ "width":"25%", "text-align" : "center", "padding": "1em"}}>
                                                        <ChartProgressBar01 
                                                            value={  Math.round(globalStats['memoryUsage']?.['p90']) || 0 }
                                                            valueSufix={"%"}
                                                            title={"p90"}
                                                            precision={0}
                                                            format={3}
                                                            fontColorValue={configuration.colors.fonts.metric100}
                                                            fontSizeValue={"16px"}
                                                        />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <ExpandableSection headerText="Widgets Options">
                                    <table style={{"width":"100%", "padding": "1em"}}>
                                        <tr>  
                                            <td style={{ "width":"100%", "text-align" : "center"}}>
                                    
                                                <Multiselect
                                                      selectedOptions={selectedOptions}
                                                      onChange={({ detail }) =>
                                                        setSelectedOptions(detail.selectedOptions)
                                                      }
                                                      options={[
                                                        { label: "Cluster LifeCycle", value: "1"},
                                                        { label: "Clusters Running", value: "2"},
                                                        { label: "Cores Total", value: "3"},
                                                        { label: "Cores Usage(%)", value: "4"},
                                                        { label: "CPU Usage(%)", value: "5"},
                                                        { label: "Instances by Class", value: "6"},
                                                        { label: "Instances by Market", value: "7"},
                                                        { label: "Instances by Role", value: "8"},
                                                        { label: "Jobs Running", value: "9"},
                                                        { label: "Memory Total(GB)", value: "10"},
                                                        { label: "Memory Usage(%)", value: "11"},
                                                      ]}
                                                      placeholder="Choose Widgets"
                                                    />
                                    
                                            </td>
                                        </tr>
                                    </table>   
                                </ExpandableSection>
                                             
                            </Container>
                            <br/>
                            { chartSelected("Cluster LifeCycle",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Cluster LifeCycle
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartTimeLine01 
                                                            series={JSON.stringify(globalStats['charts']?.['clusterLifeCycle'])} 
                                                            title={""} 
                                                            height="300px" 
                                                            onClickData={(element) => {
                                                                                console.log(element);
                                                                            }
                                                            }
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                    </Container>  
                                    <br/>
                                </div>
                            }
                            
                            { chartSelected("Instances by Role",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Instances by Role
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartColumn01 
                                                            series={JSON.stringify(globalStats['charts']?.['roles']?.['series'])}
                                                            categories={JSON.stringify(globalStats['charts']?.['roles']?.['categories'])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                    </Container>  
                                    <br/>
                                </div>
                            }
                                
                            { chartSelected("Instances by Class",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Instances by Class
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartColumn01 
                                                            series={JSON.stringify(globalStats['charts']?.['instanceType']?.['series'])}
                                                            categories={JSON.stringify(globalStats['charts']?.['instanceType']?.['categories'])} 
                                                            title={"Instances by Class"} height="300px" 
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                    </Container>  
                                    <br/>
                                </div>
                            }
                                
                                
                            { chartSelected("Instances by Market",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Instances by Market
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartColumn01 
                                                            series={JSON.stringify(globalStats['charts']?.['instanceMarket']?.['series'])}
                                                            categories={JSON.stringify(globalStats['charts']?.['instanceMarket']?.['categories'])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                    </Container>  
                                    <br/>
                                    </div>
                                }
                            
                            { chartSelected("Clusters Running",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Clusters Running
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartDots01 series={JSON.stringify([
                                                               { name : "clusters", data : globalStats['charts']?.['clusters'] }
                                                            ])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                    </Container>  
                                    <br/>
                                </div>
                            }
                            
                            { chartSelected("CPU Usage(%)",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          CPU Usage(%)
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartDots01 series={JSON.stringify([
                                                               { name : "p10", data : globalStats['charts']?.['cpuUsage']?.['p10'] },
                                                               { name : "p50", data : globalStats['charts']?.['cpuUsage']?.['p50'] },
                                                               { name : "p90", data : globalStats['charts']?.['cpuUsage']?.['p90'] },
                                                            ])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                            ymax={100}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                    </Container>  
                                    <br/>
                                </div>
                            }    
                            
                            
                            
                            { chartSelected("Cores Total",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Cores Total
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartDots01 series={JSON.stringify([
                                                               { name : "cores", data : globalStats['charts']?.['cores'] }
                                                            ])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                        </Container>  
                                    <br/>
                                </div>
                                }
                                
                                
                                { chartSelected("Cores Usage(%)",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Cores Usage(%)
                                                        </Header>
                                                        }
                                    >  
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartDots01 series={JSON.stringify([
                                                               { name : "p10", data : globalStats['charts']?.['coresUsage']?.['p10'] },
                                                               { name : "p50", data : globalStats['charts']?.['coresUsage']?.['p50'] },
                                                               { name : "p90", data : globalStats['charts']?.['coresUsage']?.['p90'] },
                                                            ])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                            ymax={100}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                        </Container>  
                                    <br/>
                                </div>
                                }
                                
                                
                                { chartSelected("Jobs Running",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Jobs Running
                                                        </Header>
                                                        }
                                    >
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartDots01 series={JSON.stringify([
                                                               { name : "jobs", data : globalStats['charts']?.['jobsRunning'] }
                                                            ])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                        </Container>  
                                    <br/>
                                </div>
                                }
                                
                                
                                { chartSelected("Memory Total(GB)",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Memory Total(GB)
                                                        </Header>
                                                        }
                                    >
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartDots01 series={JSON.stringify([
                                                               { name : "memory", data : globalStats['charts']?.['memory'] }
                                                            ])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                        </Container>  
                                    <br/>
                                </div>
                                }
                                
                                { chartSelected("Memory Usage(%)",selectedOptions) === true  &&
                                <div>
                                    <Container header={
                                                        <Header
                                                          variant="h2"
                                                        >
                                                          Memory Usage(%)
                                                        </Header>
                                                        }
                                    >
                                        <table style={{"width":"100%", "padding": "1em"}}>
                                            <tr>  
                                                <td style={{ "width":"100%", "text-align" : "center"}}>
                                                    <ChartDots01 series={JSON.stringify([
                                                               { name : "p10", data : globalStats['charts']?.['memoryUsage']?.['p10'] },
                                                               { name : "p50", data : globalStats['charts']?.['memoryUsage']?.['p50'] },
                                                               { name : "p90", data : globalStats['charts']?.['memoryUsage']?.['p90'] },
                                                            ])} 
                                                            title={""} 
                                                            height="300px" 
                                                            toolbar={true}
                                                            ymax={100}
                                                    />
                                                </td>
                                            </tr>
                                        </table>
                                        </Container>  
                                    <br/>
                                </div>
                                }
                            
                            
                            {/*                
                            <Container>
                                <CustomTable02
                                        columnsTable={columnsTableNodes}
                                        visibleContent={visibleContentNodes}
                                        dataset={clusterStats['host']?.['nodes']}
                                        title={"Nodes"}
                                        description={""}
                                        pageSize={20}
                                        onSelectionItem={( item ) => {
                                                                    currentInstanceIdentifier.current = item[0]?.["instance_id"];
                                                                    splitPanelState.current = true;
                                                                    setsplitPanelShow(true);
                                                                    gatherNodeStats();
                                          }
                                        }
                                        extendedTableProperties = {
                                            { variant : "borderless" }
                                            
                                        }
                                />
                            </Container>
                            */}
                    </div>
                </div>
                
            }
            disableContentHeaderOverlap={true}
            headerSelector="#h" 
        />
    </div>
  );
}

export default Application;

