import {memo} from 'react';
import Chart from 'react-apexcharts';

const ChartColumn = memo(({ series, categories, history, height, width="100%", title, border=2, onZoom = () => {} }) => {

    
    /*
    var series1 = [{
              name: 'PRODUCT A',
              data: [44, 55, 41, 67, 22, 43]
            }, {
              name: 'PRODUCT B',
              data: [13, 23, 20, 8, 13, 27]
            }, {
              name: 'PRODUCT C',
              data: [11, 17, 15, 15, 21, 14]
            }, {
              name: 'PRODUCT D',
              data: [21, 7, 25, 13, 22, 8]
            }];
    */  
    
    var options = {
              chart: {
                type: 'bar',
                height: height,
                stacked: true,
                foreColor: '#2ea597',
                toolbar: {
                  show: false
                },
                zoom: {
                  enabled: true
                }
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  legend: {
                    position: 'bottom',
                    offsetX: -10,
                    offsetY: 0
                  }
                }
              }],
              dataLabels: {
                enabled: false
              },
              tooltip: {
                    theme: "dark",
                    x : { 
                            format: 'HH:mm',
                    }
              },
              theme: {
                monochrome: {
                  enabled: true
                }
              },
              /*plotOptions: {
                bar: {
                  horizontal: false,
                  borderRadius: 10,
                  dataLabels: {
                    total: {
                      enabled: true,
                      style: {
                        fontSize: '13px',
                        fontWeight: 900
                      }
                    }
                  }
                },
              },*/
              xaxis: {
                type: 'datetime',
                categories: JSON.parse(categories),
              },
              grid: {
                show: false,
                yaxis: {
                    lines: {
                        show: false
                    }
                },
                xaxis: {
                            lines: {
                                show: false
                            }
                        }
              },
              legend: {
                    show: true,
                    showForSingleSeries: true,
                    fontSize: '11px',
                    fontFamily: 'Lato',
              },
              title: {
                text : title,
                align: "center",
                show: true,
                style: {
                  fontSize:  '14px',
                  fontWeight:  'bold',
                  fontFamily: 'Lato',
                }
                
              },
              fill: {
                opacity: 1
              },
              yaxis: {
                 tickAmount: 5,
                 axisTicks: {
                      show: true,
                 },
                 axisBorder: {
                      show: true,
                      color: '#78909C',
                      offsetX: 0,
                      offsetY: 0
                 },
                 min : 0,
                 labels : {
                            formatter: function(val, index) {
                                        
                                        if(val === 0) return '0';
                                        if(val < 1000) return parseFloat(val).toFixed(1);
                                        
                                        var k = 1000,
                                        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
                                        i = Math.floor(Math.log(val) / Math.log(k));
                                        return parseFloat((val / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        
                                        },    
                            style: {
                                  fontSize: '11px',
                                  fontFamily: 'Lato',
                             },
                 },
                 
              }
            };
        
        /*
        var options = {
              chart: {
                height: height,
                type: 'bar',
                foreColor: '#2ea597',
                zoom: {
                  enabled: false
                },
                animations: {
                    enabled: false,
                    easing: 'easeinout',
                },
                dynamicAnimation :
                {
                    enabled: true,
                },
                 toolbar: {
                    show: false,
                 }

              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'smooth',
                width: 1
              },
              markers: {
                size: 3,
                strokeWidth: 0,
                hover: {
                  size: 9
                }
              },
              plotOptions: {
                bar: {
                  borderRadius: 0
                }
              },
              tooltip: {
                    theme: "dark",
                    x : { 
                            format: 'HH:mm',
                    }
              },
              title: {
                text : title,
                align: "center",
                show: false,
                style: {
                  fontSize:  '14px',
                  fontWeight:  'bold',
                  fontFamily:  "Lato",
                  color : "#2ea597"
                }
                
              },
              grid: {
                show: false,
                yaxis: {
                    lines: {
                        show: false
                    }
                },
                xaxis: {
                            lines: {
                                show: false
                            }
                        }
              },
              xaxis: {
                labels: {
                          show: false,
                 },
                 categories: JSON.parse(categories),
              },
              yaxis: {
                 tickAmount: 5,
                 axisTicks: {
                      show: true,
                 },
                 axisBorder: {
                      show: true,
                      color: '#78909C',
                      offsetX: 0,
                      offsetY: 0
                 },
                 min : 0,
                 labels : {
                            formatter: function(val, index) {
                                        
                                        if(val === 0) return '0';
                                        if(val < 1000) return parseFloat(val).toFixed(1);
                                        
                                        var k = 1000,
                                        sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
                                        i = Math.floor(Math.log(val) / Math.log(k));
                                        return parseFloat((val / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        
                                        },    
                            style: {
                                  fontSize: '11px',
                                  fontFamily: 'Lato',
                             },
                 },
                 
              }
    };
    */
    
        //<Chart options={options} series={series1} type="bar" width={width} height={height} />
        
        //<Chart options={options} series={JSON.parse(series)} type="bar" width={width} height={height} />
            
    return (
            <div>
                <Chart options={options} series={JSON.parse(series)} type="bar" width={width} height={height} />
            </div>
           );
});

export default ChartColumn;
