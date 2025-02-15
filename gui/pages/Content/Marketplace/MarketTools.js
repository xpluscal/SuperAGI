import React, {useEffect, useState} from "react";
import Image from "next/image";
import styles from './Market.module.css';
import {fetchToolTemplateList} from "@/pages/api/DashboardService";
import {EventBus} from "@/utils/eventBus";
import {loadingTextEffect, excludedToolkits, returnToolkitIcon} from "@/utils/utils";
import axios from 'axios';

export default function MarketTools() {
  const [toolTemplates, setToolTemplates] = useState([])
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const [loadingText, setLoadingText] = useState("Loading Toolkits");

  useEffect(() => {
    loadingTextEffect('Loading Toolkits', setLoadingText, 500);

    if (window.location.href.toLowerCase().includes('marketplace')) {
      setShowMarketplace(true);
      axios.get('https://app.superagi.com/api/toolkits/marketplace/list/0')
        .then((response) => {
          const data = response.data || [];
          const filteredData = data?.filter((item) => !excludedToolkits().includes(item.name));
          setToolTemplates(filteredData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching tool templates:', error);
        });
    } else {
      fetchToolTemplateList()
        .then((response) => {
          const data = response.data || [];
          const filteredData = data?.filter((item) => !excludedToolkits().includes(item.name));
          setToolTemplates(filteredData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching tools:', error);
        });
    }
  }, []);

  function handleTemplateClick(item) {
    const contentType = 'tool_template';
    EventBus.emit('openTemplateDetails', {item, contentType});
  }

  return (
    <div style={showMarketplace ? {marginLeft: '8px'} : {marginLeft: '3px'}}>
      <div className={styles.rowContainer} style={{maxHeight: '78vh', overflowY: 'auto'}}>
        {!isLoading ? <div>
          {toolTemplates.length > 0 ? <div className={styles.resources}>{toolTemplates.map((item) => (
            <div className={styles.market_tool} key={item.id} style={{cursor: 'pointer'}} onClick={() => handleTemplateClick(item)}>
              <div style={{display: 'inline-flex', overflow: 'auto'}}>
                <Image className={styles.tools_icon} width={40} height={40} src={returnToolkitIcon(item.name)} alt="tool-icon"/>
                <div className="ml_12 mb_8">
                    <div>{item.name}</div>
                    <div style={{color: '#888888', lineHeight: '16px'}}>by SuperAgi&nbsp;<Image width={14} height={14} src="/images/is_verified.svg" alt="is_verified"/></div>
                </div>
              </div>
              <div className={styles.tool_description}>{item.description}</div>
            </div>
          ))}</div> : <div className="center_container mt_40">
            <Image width={150} height={60} src="/images/no_permissions.svg" alt="no-permissions"/>
            <span className={styles.feed_title} style={{marginTop: '8px'}}>No Tools found!</span>
          </div>}
        </div> : <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh'}}>
          <div className="signInInfo" style={{fontSize: '16px', fontFamily: 'Source Code Pro'}}>{loadingText}</div>
        </div>}
      </div>
    </div>
  )
};