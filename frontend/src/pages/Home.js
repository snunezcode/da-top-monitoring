import {useState,useEffect} from 'react'

import { applicationVersionUpdate } from '../components/Functions';
import Flashbar from "@cloudscape-design/components/flashbar";
import CustomHeader from "../components/Header";
import ContentLayout from '@cloudscape-design/components/content-layout';
import { configuration } from './Configs';

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Badge from "@cloudscape-design/components/badge";
import AppLayout from '@cloudscape-design/components/app-layout';

import '@aws-amplify/ui-react/styles.css';


function Home() {
  
  //-- Application Version
  const [versionMessage, setVersionMessage] = useState([]);
  
  
  //-- Call API to App Version
   async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbwcmp", moduleId: "home"} );
        
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
        gatherVersion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
  return (
      
    <div>
      <CustomHeader/>
      <AppLayout
            toolsHide
            navigationHide
            contentType="default"
            content={
              <ContentLayout 
                          header = {
                                   <>
                                      <Flashbar items={versionMessage} />
                                      <br/>
                                      <Header variant="h1">
                                              Welcome to {configuration["apps-settings"]["application-title"]} Solution
                                      </Header>
                                      <br/>
                                      <Box fontSize="heading-s">
                                          Gain Monitoring Insight and Take Action on AWS Database Resources.
                                      </Box>
                                      <br/>
                                      <Box fontSize="heading-s">
                                          View performance data for AWS Database instances and clusters, so you can quickly identify and act on any issues that might impact database resources.
                                      </Box>
                                      <br/>
                                  </>
                                    
                                    
                                }
                                
                    >
                  
                    <div>
                    <ColumnLayout columns={2} >
                      
                            <div>
                                <Container
                                      header = {
                                        <Header variant="h2">
                                          How it works?
                                        </Header>
                                        
                                      }
                                  >
                                        <div>
                                                  <Badge>1</Badge> Connect to your AWS Database resorces.
                                                  <br/>
                                                  <br/>
                                                  <Badge>2</Badge> Gather realtime performance database metrics from engine itself.
                                                  <br/>
                                                  <br/>
                                                  <Badge>3</Badge> Extract performance from AWS Cloudwatch metrics and Enhanced Monitoring.
                                                  <br/>
                                                  <br/>
                                                  <Badge>4</Badge> Consolidate all information into centralized dashboard.
                                        </div>
                              </Container>
                              
                          </div>
                    
                          <div>
                                    <Container
                                          header = {
                                            <Header variant="h2">
                                              Getting Started
                                            </Header>
                                            
                                          }
                                      >
                                            <div>
                                              <Box variant="p">
                                                  Start connecting to your AWS RDS instances or Amazon Aurora, ElastiCache, MemoryDB, DocumentDB clusters.
                                              </Box>
                                              <br/>
                                              <Button variant="primary" href="/rds/instances/" >Get Started</Button>
                                              <br/>
                                              <br/>
                                            </div>
                                  </Container>
                                  
                          </div>
                              
                          
                          </ColumnLayout>
                          <br/>
                          <Container
                                      header = {
                                        <Header variant="h2">
                                          Use cases
                                        </Header>
                                        
                                      }
                                  >
                                         <ColumnLayout columns={1} variant="text-grid">
                                              <div>
                                                <Header variant="h3">
                                                  Monitor instance performance
                                                </Header>
                                                <Box variant="p">
                                                  Visualize performance data on realtime, and correlate data to understand and resolve the root cause of performance issues in your database resources.
                                                </Box>
                                              </div>
                                              <div>
                                                <Header variant="h3">
                                                  Perform root cause analysis
                                                </Header>
                                                <Box variant="p">
                                                  Analyze database and operating system metrics to speed up debugging and reduce overall mean time to resolution.
                                                </Box>
                                              </div>
                                              <div>
                                                <Header variant="h3">
                                                  Optimize resources proactively
                                                </Header>
                                                <Box variant="p">
                                                  Identify top consumer sessions, gather database statements and resource usages.
                                                </Box>
                                              </div>
                                              
                                        </ColumnLayout>
                              </Container>
                              
                          </div>
                      </ContentLayout>
            }
          />
    </div>
    
  );
}

export default Home;
