import { useState,useEffect } from 'react'
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu } from './Configs';
import { createSearchParams } from "react-router-dom";

import { applicationVersionUpdate, gatherLocalVersion, getMatchesCountText, paginationLabels, pageSizePreference, EmptyState } from '../components/Functions';
import { createLabelFunction } from '../components/Functions';

import SideNavigation from '@cloudscape-design/components/side-navigation';
import AppLayout from '@cloudscape-design/components/app-layout';

import { useCollection } from '@cloudscape-design/collection-hooks';
import {CollectionPreferences,Pagination } from '@cloudscape-design/components';
import TextFilter from "@cloudscape-design/components/text-filter";

import Table from "@cloudscape-design/components/table";
import { StatusIndicator } from '@cloudscape-design/components';
import { ColumnLayout } from '@cloudscape-design/components';
import { Box } from '@cloudscape-design/components';
import Flashbar from "@cloudscape-design/components/flashbar";
import Container from "@cloudscape-design/components/container";
import Spinner from "@cloudscape-design/components/spinner";

import { SplitPanel } from '@cloudscape-design/components';
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import CustomHeader from "../components/Header";
import CustomTable02 from "../components/Table02";

import Header from "@cloudscape-design/components/header";
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


//-- Encryption
var CryptoJS = require("crypto-js");

function Application() {

    
    //-- Application Version
    const [versionMessage, setVersionMessage] = useState([]);
    const [messages, setMessages] = useState([]);
    const [updateStatus, setUpdateStatus] = useState({ status : "", release : "0.0.0" });
  
    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
    
    
    //-- Table Messages
    const columnsTable =  [
                  {id: 'timestamp', header: 'Timestamp',cell: item => item['timestamp'],ariaLabel: createLabelFunction('timestamp'),sortingField: 'timestamp', width: 230,},
                  {id: 'message', header: 'Messages',cell: item => item['message'],ariaLabel: createLabelFunction('message'),sortingField: 'message',}
    ];
    
    const visibleContent = ['timestamp','message'];
    
   
   //-- Gather Import Process
   async function gatherApplicationUpdateStatus (){
     
      var version = await gatherLocalVersion();
      
      try {
        
            var api_url = configuration["apps-settings"]["api-url"];
            var params = {};
            Axios.get(`${api_url}/api/aws/application/update/status`,{
                      params: params, 
                  }).then((data)=>{
                    
                   console.log(data);
                   setMessages(data.data.messages);
                   setUpdateStatus({ status : data.data.status, release : version['release'] } );
                   
                     
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aws/application/update/status' );
                  console.log(err);
              });
            
        }
        catch{
        
          console.log('Timeout API error : /api/aws/application/update/status');                  
          
        }
    
    }
    
    function onClickUpdate(){
      
        try {
        
            setMessages([]);
            var api_url = configuration["apps-settings"]["api-url"];
            var params = {};
            Axios.get(`${api_url}/api/aws/application/update/start`,{
                      params: params, 
                  }).then((data)=>{
                    
                   console.log(data);
                   
                     
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/aws/application/update/start' );
                  console.log(err);
              });
            
        }
        catch{
        
          console.log('Timeout API error : /api/aws/application/update/start');                  
          
        }
            

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
        gatherVersion();
        const id = setInterval(gatherApplicationUpdateStatus, configuration["apps-settings"]["refresh-interval-emr-cluster"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
    
    
    
  return (
    <div>
        <CustomHeader/>
        <AppLayout
            disableContentPaddings
            toolsHide
            navigation={<SideNavigation activeHref={"/updates"} items={SideMainLayoutMenu} header={SideMainLayoutHeader} />}
            contentType="default"
            content={
                
                <div style={{"padding" : "2em"}}>
                    <Flashbar items={versionMessage} />
                    
                    <br/>
                    <Container header={<Header variant="h2" description="This module will update the application to last version available, click on update button to start the process.">
                                           { ( updateStatus['status'] == 'in-progress' )  &&
                                                <Spinner size="big" />
                                            }
                                            Application Updates
                                          </Header>
                                      } 
                      >
                        <CustomTable02
                                columnsTable={columnsTable}
                                visibleContent={visibleContent}
                                dataset={messages}
                                title={"Messages"}
                                description={""}
                                pageSize={20}
                                onSelectionItem={( item ) => {
                                    /*
                                    currentInstanceIdentifier.current = item[0]?.["instance_id"];
                                    setsplitPanelShow(true);
                                    gatherNodeStats();
                                    */
                                  }
                                }
                                extendedTableProperties = {
                                    { variant : "borderless" }
                                    
                                }
                                tableActions = {
                                        <SpaceBetween
                                            direction="horizontal"
                                            size="xs"
                                          >
                                          <Button>Current version : {updateStatus['release']}</Button>
                                          <Button variant="primary" onClick={ onClickUpdate }>Update</Button>
                                        </SpaceBetween>
                                }
                                
                        />
                    </Container>
                    
                </div>
                
                
                
            }
            disableContentHeaderOverlap={true}
            headerSelector="#h" 
        />
                      
    </div>
  );
}

export default Application;

