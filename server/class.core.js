const { groupBy } = require("core-js/actual/array/group-by"); 

// AWS Config Variables
const fs = require('fs');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));

//-- AWS Object
const { classAWS } = require('./class.aws.js');
const AWSObject = new classAWS();


//-- Logging Object
const { classLogging } = require('./class.logging.js');


//-- Logging Object
var configuration = require('./configuration');



//--#############
//--############# FUNCTIONS                                                                                        
//--#############


function replaceParameterValues(str, obj) {
  var re = /\{(.+?)\}/g;
  return str.replace(re, function(_,m){return obj[m]});
}


//--#############
//--############# CLASS : classEMRCluster                                                                                                
//--#############


class classEMRCluster {

        
        //-- Looging
        #objLog = new classLogging({ name : "classEMRCluster", instance : "generic" });
        
        
        //-- Cluster Metrics
        #metrics = {};
        #metricList = [];
        #dimension = [];
        #metricCatalog = {
                        'MemoryAvailableMB' : { factor : 1, type : "Average", label : "memoryFreeMB" },
        };
        
        //--  Metadata
        #clusterMetadata = {};
        #instances =  [];
        #clusterStats =  {
                                clusterId       : "",
                                name            : "",
                                status          : "-",
                                collectionType  : "-",
                                release         : "-",
                                applications    : "-",
                                os              : "-",
                                lastUpdate      : "-",
                                host            : {
                                                    
                                                    totalVCPUs      : 0,
                                                    totalMemory     : 0,
                                                    totalNodes      : 0,
                                                    cpuUsage        : 0,
                                                    memoryUsage     : 0,
                                                    networkTotal    : 0,
                                                    networkSent     : 0,
                                                    networkRecv     : 0,
                                                    diskIopsReads   : 0,
                                                    diskIopsWrites  : 0,
                                                    diskIops        : 0,
                                                    diskBytesReads  : 0,
                                                    diskBytesWrites : 0,
                                                    diskBytes       : 0,
                                                    nodes           : [],
                                                    charts          : {
                                                                        cpu                 : { avg : [], max : [], min : [] },
                                                                        memory              : { avg : [], max : [], min : [] },
                                                                        diskBytes           : { avg : [], max : [], min : [] },
                                                                        diskIops            : { avg : [], max : [], min : [] },
                                                                        network             : { avg : [], max : [], min : [] },
                                                                        rolesColumn         : { series : [], categories : [] },
                                                                        instanceTypeColumn  : { series : [], categories : [] },
                                                                        instanceMarketColumn : { series : [], categories : [] },
                                                                        instanceTypes       : [],
                                                                        marketTypes         : [],
                                                                        roles               : [],
                                                                        
                                                    },
                                },
                                hadoop : {
                                            coresAvailable          : 0,
                                            coresAllocated          : 0,              
                                            coresPending            : 0,              
                                            coresTotal              : 0,              
                                            coresUsage              : 0,                  
                                            coresReserved           : 0,              
                                            memoryAllocated         : 0,
                                            memoryAvailable         : 0,              
                                            memoryPending           : 0,       
                                            memoryReserved          : 0,              
                                            memoryTotal             : 0,              
                                            memoryUsage             : 0,              
                                            appsCompleted           : 0,
                                            appsFailed              : 0,        
                                            appsKilled              : 0,
                                            appsPending             : 0,
                                            appsRunning             : 0,
                                            appsSubmitted           : 0,
                                            containersAllocated     : 0,          
                                            containersPending       : 0,              
                                            containersReserved      : 0,              
                                            nodesActive             : 0,
                                            nodesDecommissioned     : 0,              
                                            nodesDecommissioning    : 0,              
                                            nodesLost               : 0,              
                                            nodesRebooted           : 0,
                                            nodesShutdown           : 0,              
                                            nodesTotal              : 0,              
                                            nodesUnhealthy          : 0,              
                                            charts                  : {
                                                                        coresAvailable          : [],
                                                                        coresAllocated          : [],
                                                                        coresPending            : [],
                                                                        coresTotal              : [],
                                                                        coresUsage              : [],
                                                                        coresReserved           : [],
                                                                        nodesActive             : [],
                                                                        memoryAllocated         : [],
                                                                        memoryAvailable         : [],
                                                                        memoryPending           : [],
                                                                        memoryReserved          : [],
                                                                        memoryTotal             : [],
                                                                        memoryUsage             : [],
                                                                        appsCompleted           : [],
                                                                        appsFailed              : [],
                                                                        appsKilled              : [],
                                                                        appsPending             : [],
                                                                        appsRunning             : [],
                                                                        appsSubmitted           : [],
                                                                        containersAllocated     : [],
                                                                        containersPending       : [],
                                                                        containersReserved      : [],
                                                                        nodesDecommissioned     : [],
                                                                        nodesdecommissioning    : [],
                                                                        nodesLost               : [],
                                                                        nodesRebooted           : [],
                                                                        nodesShutdown           : [],
                                                                        nodesTotal              : [],
                                                                        nodesUnhealthy          : [],
                                            }
                                    
                                }
        };
        
        
        
        //-- Object Properties
        objectProperties;
        
        
        //-- Constructor method
        constructor(object) { 
            
                this.objectProperties = object.properties;
                this.#objLog.properties = {...this.#objLog.properties, clusterId : this.objectProperties.clusterId }
                
                //-- Create AWS Metric Catalog -- Pending
                /*
                this.#dimension = [ 
                                    { Name: "JobFlowId", Value: this.objectProperties.clusterId }, 
                ];
                for (let metric of Object.keys(this.#metricCatalog)) {
                        this.#metricList.push({
                            namespace : "AWS/ElasticMapReduce",
                            metric : metric,
                            label : this.#metricCatalog[metric].label,
                            dimension : this.#dimension,
                            stat : this.#metricCatalog[metric].type
                        });
                        this.#metrics[metric] = { value : 0, history : [] };
                        
                };
                */
                            
        }
        
        
        //-- Gather Metadata
        async gatherMetadata(){
        
                var parameter = {
                   ClusterId: this.objectProperties.clusterId
                };
    
    
                try {
                    
                    this.#clusterMetadata = await AWSObject.getEMRClusterMetadata(parameter);
                    
                    
                } catch(error) {
                    this.#objLog.write("gatherMetadata","err",error);
                    
                }
            
        }
        
        
        //-- Gather CloudWatch Metrics
        async getCloudWatchMetrics(){
            
            
            
            const clwMetrics = await AWSObject.getGenericMetricsDataset({ metrics : this.#metricList, interval : 60, period : 1 });
            
            var result = {};
            clwMetrics.forEach(item => {
                    try {
                            
                            const values = item['Timestamps'].map((record,iPosition) => [record,item['Values'][iPosition]]); 
                            result = { ...result, [item.Label] : values };
                            return 
                            
                    }
                    catch(err){
                        this.#objLog.write("getCloudWatchMetrics","err",err);
                    }
            });
            
            return result;
        
        }
        
        
        //-- Refresh Cluster Data 
        async refreshData(){
            try {
                
                //-- Update Metadata
                this.gatherMetadata();
                
                
                //+++++++ SECTION 1 : Gather Node Performance Information (Table)
                
                var parameters = { cluster_id : this.objectProperties.clusterId };
                var nodesSummary = await AWSObject.executeTSQuery({ query : replaceParameterValues(configuration['queries']['cluster']['nodesSummary'], parameters ) });
                
                
                //-- Instance Types Summary
                var stats = nodesSummary.groupBy(node => node.instance_type);
                var instanceTypes = [];
                for (let item of Object.keys(stats)) {
                        instanceTypes.push({ name : item, value : stats[item].length });
                }
                
                instanceTypes.sort((a, b) => {
                    let fa = a.name.toLowerCase(),fb = b.name.toLowerCase();
                    if (fa < fb) 
                        return -1;
                    if (fa > fb) 
                        return 1;
                    return 0;
                });

                
                //-- Instance Market Type Summary
                stats = nodesSummary.groupBy(node => node.market_type);
                var marketTypes = [];
                for (let item of Object.keys(stats)) {
                        marketTypes.push({ name : item, value : stats[item].length });
                }
                
                marketTypes.sort((a, b) => {
                    let fa = a.name.toLowerCase(),fb = b.name.toLowerCase();
                    if (fa < fb) 
                        return -1;
                    if (fa > fb) 
                        return 1;
                    return 0;
                });
                
                
                //-- Instance role
                stats = nodesSummary.groupBy(node => node.role);
                var roles = [];
                for (let item of Object.keys(stats)) {
                        roles.push({ name : item, value : stats[item].length });
                }               
                
                roles.sort((a, b) => {
                    let fa = a.name.toLowerCase(),fb = b.name.toLowerCase();
                    if (fa < fb) 
                        return -1;
                    if (fa > fb) 
                        return 1;
                    return 0;
                });
                
                
                var totalNodes = 0;
                var totalVCPUs = 0;
                var totalMemory = 0;
                nodesSummary.forEach(item => {
                        totalVCPUs = totalVCPUs + item.total_vcpu;
                        totalMemory = totalMemory + item.total_memory;
                        totalNodes++;
                });
                
                 
                //+++++++ SECTION 2 : Gather Nodes By Role 
                 
                var parameters = { cluster_id : this.objectProperties.clusterId, period : '60m' };
                var records = await AWSObject.executeTSQuery({ query : replaceParameterValues(configuration['queries']['cluster']['nodesByRole'], parameters ) });
                
                
                //-- Roles Grouping
                var roleUnique = records.groupBy( node => node.role )
                var rolesSeries = [];
                var rolesCategories = [];
                for (let item of Object.keys(roleUnique)) {
                        
                        var values = roleUnique[item].map(function (obj) {
                          return obj.total;
                        });
                        
                        rolesSeries.push({ name : item, data : values });
                        
                        if (rolesCategories.length == 0) {
                            rolesCategories = roleUnique[item].map(function (obj) {
                              return obj.time;
                            });
                        }
                }
                
                
                //+++++++ SECTION 3 : Gather Nodes By Instance Types
                
                
                var parameters = { cluster_id : this.objectProperties.clusterId, period : '60m' };
                var records = await AWSObject.executeTSQuery({ query : replaceParameterValues(configuration['queries']['cluster']['nodesByInstanceType'], parameters ) });
                
                
                //-- Instances Grouping
                var instanceTypesUnique = records.groupBy( node => node.instance_type )
                var instanceTypesSeries = [];
                var instanceTypesCategories = [];
                for (let item of Object.keys(instanceTypesUnique)) {
                        
                        var values = instanceTypesUnique[item].map(function (obj) {
                          return obj.total;
                        });
                        
                        instanceTypesSeries.push({ name : item, data : values });
                        
                        if (instanceTypesCategories.length == 0) {
                            instanceTypesCategories = instanceTypesUnique[item].map(function (obj) {
                              return obj.time;
                            });
                        }
                }
                
                //+++++++ SECTION 4 : Gather Nodes By Market Type
                
                
                var parameters = { cluster_id : this.objectProperties.clusterId, period : '60m' };
                var records = await AWSObject.executeTSQuery({ query : replaceParameterValues(configuration['queries']['cluster']['nodesByMarketType'], parameters ) });
                
                
                //-- Instances Grouping
                var instanceMarketUnique = records.groupBy( node => node.market_type )
                var instanceMarketSeries = [];
                var instanceMarketCategories = [];
                for (let item of Object.keys(instanceMarketUnique)) {
                        
                        var values = instanceMarketUnique[item].map(function (obj) {
                          return obj.total;
                        });
                        
                        instanceMarketSeries.push({ name : item, data : values });
                        
                        if (instanceMarketCategories.length == 0) {
                            instanceMarketCategories = instanceMarketUnique[item].map(function (obj) {
                              return obj.time;
                            });
                        }
                }
                
                
                //+++++++ SECTION 5 : Gather Cluster Performance Information over time
                
                    
                var parameters = { cluster_id : this.objectProperties.clusterId, period : '15m' };
                var records = await AWSObject.executeTSQuery({ query : replaceParameterValues(configuration['queries']['cluster']['clusterHostSummary'], parameters ) });
            
                 
                //-- CPU
                var cpuAvg = records.map(function (obj) {
                    return [obj.time, obj.cpu_usage_avg] ;
                });
                
                var cpuMax = records.map(function (obj) {
                    return [obj.time, obj.cpu_usage_max] ;
                });
                
                var cpuMin = records.map(function (obj) {
                    return [obj.time, obj.cpu_usage_min] ;
                });
               
                   
                //-- Memory    
                var memoryAvg = records.map(function (obj) {
                  return [obj.time, obj.memory_usage_avg];
                });
                
                var memoryMax = records.map(function (obj) {
                  return [obj.time, obj.memory_usage_max];
                });
                
                var memoryMin = records.map(function (obj) {
                  return [obj.time, obj.memory_usage_min];
                });
                
                //-- Network
                var networkAvg  = records.map(function (obj) {
                  return [obj.time, obj.network_bytes_avg];
                });
                
                var networkMax  = records.map(function (obj) {
                  return [obj.time, obj.network_bytes_max];
                });
                
                var networkMin  = records.map(function (obj) {
                  return [obj.time, obj.network_bytes_min];
                });
                
                //--Disk Bytes
                var diskBytesAvg = records.map(function (obj) {
                  return [obj.time, obj.disk_bytes_avg];
                });
                
                var diskBytesMax = records.map(function (obj) {
                  return [obj.time, obj.disk_bytes_max];
                });
                
                var diskBytesMin = records.map(function (obj) {
                  return [obj.time, obj.disk_bytes_min];
                });
                
                //-- Disk Iops
                var diskIopsAvg = records.map(function (obj) {
                  return [obj.time, obj.disk_iops_avg];
                });
                
                var diskIopsMax = records.map(function (obj) {
                  return [obj.time, obj.disk_iops_max];
                });
                
                var diskIopsMin = records.map(function (obj) {
                  return [obj.time, obj.disk_iops_min];
                });
                
                
                //+++++++ SECTION 6 : Gather Hadoop Performance (Table)
                
                var parameters = { cluster_id : this.objectProperties.clusterId, period : '5m' };
                var hadoopSummary = await AWSObject.executeTSQuery({ query : replaceParameterValues(configuration['queries']['cluster']['clusterHadoopSummary'], parameters ) });
                
                
                //+++++++ SECTION SUMMARY 
                
                this.#clusterStats = { 
                                        ...this.#clusterStats, 
                                        lastUpdate : new Date().toTimeString().split(' ')[0],
                                        host : {
                                                    ...{
                                                        totalVCPUs : totalVCPUs,
                                                        totalMemory : totalMemory,
                                                        totalNodes : totalNodes,
                                                        cpuUsage : records[records.length-2]?.['cpu_usage_avg'],
                                                        memoryUsage : records[records.length-2]?.['memory_usage_avg'],
                                                        networkTotal : records[records.length-2]?.['network_bytes'],
                                                        networkSent : records[records.length-2]?.['network_sent_bytes'],
                                                        networkRecv : records[records.length-2]?.['network_recv_bytes'],
                                                        diskIopsReads : records[records.length-2]?.['disk_io_reads'],
                                                        diskIopsWrites : records[records.length-2]?.['disk_io_writes'],
                                                        diskIops : records[records.length-2]?.['disk_iops'],
                                                        diskBytesReads : records[records.length-2]?.['disk_bytes_reads'],
                                                        diskBytesWrites : records[records.length-2]?.['disk_bytes_writes'],
                                                        diskBytes : records[records.length-2]?.['disk_bytes'],
                                                        nodes : nodesSummary,
                                                    }, 
                                                    charts : { 
                                                                cpu                 : { avg : cpuAvg, max : cpuMax, min : cpuMin },
                                                                memory              : { avg : memoryAvg, max : memoryMax, min : memoryMin },
                                                                diskBytes           : { avg : diskBytesAvg, max : diskBytesMax, min : diskBytesMin },
                                                                diskIops            : { avg : diskIopsAvg, max : diskIopsMax, min : diskIopsMin },
                                                                network             : { avg : networkAvg, max : networkMax, min : networkMin },
                                                                rolesColumn         : { series : rolesSeries, categories : rolesCategories },
                                                                instanceTypesColumn : { series : instanceTypesSeries, categories : instanceTypesCategories },
                                                                instanceMarketColumn : { series : instanceMarketSeries, categories : instanceMarketCategories },
                                                                instanceTypes       : instanceTypes, 
                                                                marketTypes         : marketTypes, 
                                                                roles               : roles 
                                                    }
                                        },
                                        hadoop : {
                                                     ...hadoopSummary[0]
                                        }
                    
                };
                
                
            } catch(error) {
                    this.#objLog.write("refreshData","err",error);
                    
            }
            
            
        }
        
        //-- Get Cluster Information
        async getClusterData(){
            try {
                
                await this.refreshData();
                
                return {
                        ...this.#clusterStats,
                        clusterId       : this.#clusterMetadata['Cluster']?.['Id'],
                        name            : this.#clusterMetadata['Cluster']?.['Name'],
                        status          : this.#clusterMetadata['Cluster']?.['Status']?.['State'],
                        collectionType  : this.#clusterMetadata['Cluster']?.['InstanceCollectionType'],
                        release         : this.#clusterMetadata['Cluster']?.['ReleaseLabel'],
                        applications    : this.#clusterMetadata['Cluster']?.['Applications'],
                        os              : this.#clusterMetadata['Cluster']?.['OSReleaseLabel'],
                };
                
                
            } catch(error) {
                    this.#objLog.write("getClusterData","err",error);
                    
            }
            
            
        }
        
        
        //-- Get Cluster Steps
        async getClusterSteps(object){
            
            try {
                
                var result = await AWSObject.getEMRClusterSteps(object);
                return result;
                
            } catch(error) {
                this.#objLog.write("getClusterSteps","err",error);
                
            }
            
        }
        
        
        //-- Get Node Metrics
        async getNodeMetrics(object){
            var result = {};
            try {
                
                
                var parameters = { cluster_id : this.objectProperties.clusterId, instance_id : object.instanceId, period : '15m' };
                var records = await AWSObject.executeTSQuery({ query : replaceParameterValues(configuration['queries']['node']['metricsDetails'], parameters ) });
            
                var cpu = records.map(function (obj) {
                    return [obj.time, obj.cpu_usage] ;
                });
                
                var memory = records.map(function (obj) {
                    return [obj.time, obj.memory_usage] ;
                });
                
                var netSent = records.map(function (obj) {
                    return [obj.time, obj.network_sent] ;
                });
                
                var netRecv = records.map(function (obj) {
                    return [obj.time, obj.network_recv] ;
                });
                
                var diskReadBytes = records.map(function (obj) {
                    return [obj.time, obj.disk_read_bytes] ;
                });
                
                var diskWriteBytes = records.map(function (obj) {
                    return [obj.time, obj.disk_write_bytes] ;
                });
                
                var diskReadIops = records.map(function (obj) {
                    return [obj.time, obj.disk_read_iops] ;
                });
                
                var diskWriteIops = records.map(function (obj) {
                    return [obj.time, obj.disk_write_iops] ;
                });
                
                result = { 
            
                            cpuUsage : records[records.length-1]?.['cpu_usage'],
                            memoryUsage : records[records.length-1]?.['memory_usage'],
                            networkTotal : records[records.length-1]?.['network_bytes'],
                            networkSent : records[records.length-1]?.['network_sent'],
                            networkRecv : records[records.length-1]?.['network_recv'],
                            diskIopsReads : records[records.length-1]?.['disk_read_iops'],
                            diskIopsWrites : records[records.length-1]?.['disk_write_iops'],
                            diskIops : records[records.length-1]?.['disk_iops'],
                            diskBytesReads : records[records.length-1]?.['disk_read_bytes'],
                            diskBytesWrites : records[records.length-1]?.['disk_write_bytes'],
                            diskBytes : records[records.length-1]?.['disk_bytes'],
                            charts : { 
                                        cpu                 : cpu,
                                        memory              : memory,
                                        networkSent         : netSent,
                                        networkRecv         : netRecv,
                                        diskReadBytes       : diskReadBytes,
                                        diskWriteBytes      : diskWriteBytes,
                                        diskReadIops        : diskReadIops,
                                        diskWriteIops       : diskWriteIops
                            },
                };
                
                
            } catch(error) {
                
                this.#objLog.write("getClusterSteps","err",error);
                
            }
            
            return result;
            
        }
        
        

}


module.exports = { classEMRCluster };



                