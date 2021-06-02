import React, {useState, useEffect, useRef} from 'react';
import { Container } from 'semantic-ui-react';
import { VictoryChart, VictoryAxis,VictoryVoronoiContainer, VictoryScatter, VictoryTooltip} from "victory";

export const Chart = ({pairWiseData, loading, setPairWiseData, setActiveSet }) =>{

    const data = useRef()
    data.current = pairWiseData

    function handleActivePoint(datum){
        
        var tempIndex = datum['index'];
        var tempCopyPairWiseData = pairWiseData;

        // Resetting highlighted color when active
        for (var ind in tempCopyPairWiseData){
          tempCopyPairWiseData[ind]['Stroke'] = 'green';
        }
        tempCopyPairWiseData[tempIndex]['Stroke'] = '#FF7800';

        // console.log('datum datum genes')
        var tempDatumGenes = datum['datum']['Genes']
        // console.log(tempDatumGenes)
        // TODO : Clean this code up 
        var noQuotes = tempDatumGenes.split("'").join('');
        noQuotes = noQuotes.slice(1,-1)
        noQuotes = noQuotes.replace(/ /g,'')

        var res = noQuotes.split(',')

        setPairWiseData(tempCopyPairWiseData)

        setActiveSet(res);
    }

    return(
            <VictoryChart 
            containerComponent={<VictoryVoronoiContainer/>}>
                <VictoryAxis style={{axisLabel:{padding:35}}} invertAxis={true} label='Hypergeometric P-Value' scale='log'/>
                <VictoryAxis style={{axisLabel:{padding:35}}} dependentAxis={true} label='Score' scale='log'/>
                <VictoryScatter 
                    data={data.current}
                    x = 'PVal'
                    y = 'Score'
                    
                    size={3}
                    scale={{x:'log', y:'linear'}} 
                    labels= {({datum})=> datum.GeneSetName +'\n'+ datum.GeneSetDescription}
                    labelComponent={<VictoryTooltip/>}

                    events={[
                        {
                          target: "data",
                          eventHandlers: {
                            onClick: (evt, clickedProps) => handleActivePoint(clickedProps)
                          }
                        }
                      ]}

                    style={{
                        labels:{fontSize:10}, 
                        data: {fill:({ datum }) => datum.Stroke,  strokeWidth: ({ active }) => active ? 4 : 1} }} 
                />
                    
            </VictoryChart>
    )
}