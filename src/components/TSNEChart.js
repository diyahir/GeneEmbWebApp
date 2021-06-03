import React, {useState} from 'react';
import { Container } from 'semantic-ui-react';
import { VictoryChart, VictoryLegend, VictoryAxis, VictoryScatter, VictoryTooltip} from "victory";



export const TSNEChart = ({geneData, geneSet, activeSet, setGeneData, releventGeneData}) =>{
    
    // console.log(releventGeneData)

    const [allGenesFlag, setAllGenesFlag] = useState(false);
    var noQuotes = geneSet.split("'").join('');
    noQuotes = noQuotes.replace(/ /g,'');
    var res = noQuotes.split(',');

    const relevantGenesLegend = [
        { name: "In Query" }, 
        { name: "In Both" }, 
        { name: "In Selected" }
    ];

    const relevantGeneColors = [ "green", "blue", "red"]
   
    const relevantAllGeneColors = ["red"]

    const relevantAllGenesLegend = [
        { name: "Relevent Gene" }
    ]

    function getLegend(){
        if (allGenesFlag){
            return relevantAllGenesLegend
        }
        return relevantGenesLegend
    }

    function getColors(){
        if (allGenesFlag){
            return relevantAllGeneColors
        }
        return relevantGeneColors
    }
    function handleToggleSwitch(){
        setAllGenesFlag(!allGenesFlag)
    }

    function getData(){
        if (allGenesFlag){
            return geneData
        }
        return releventGeneData
    }

    if (allGenesFlag){
        setGeneColor(geneData,res,activeSet)
    }
    else{
        setGeneColor(releventGeneData,res,activeSet)
    }
    // console.log(geneData)


    function setAllFlagColor(tempData){

        for( var geneInd in tempData ){

            var gene = geneData[geneInd]
            
            if (gene['Relevant'] === 1){
                gene['Stroke'] = 'red'
                gene['Opacity'] = 0.7
            }
            else{
                gene['Opacity'] = 0.5
            }
        }
    }

    function getChartType(){
        // Necessary to do this 'hacky' solution to have labels off on all-data chart as it is 
        // too lagy and unusable with labels 
        if (allGenesFlag){
            return <VictoryScatter 
            data={getData()}
            x = 'x'
            y = 'y'
            size={2.5}
            labelComponent={<VictoryTooltip/>}
            style={{
                labels:{fontSize:10}, 
                data: {fill: ({ datum }) => datum.Stroke, 
                // fillOpacity:'0.6',
                fillOpacity: ({ datum }) => datum.Opacity, 

                size: ({ datum }) => datum.Size, 
                // stroke:({ datum }) => datum.Stroke, 
                strokeWidth: ({ datum,active }) => active ? datum.StrokeWidth:datum.StrokeWidth*0.5 }} }
        /> 
        }
        return <VictoryScatter 
        data={getData()}
        x = 'x'
        y = 'y'
        size={2.5}
        labels= { ({datum}) =>  datum.geneSymbol }
        labelComponent={<VictoryTooltip/>}
        style={{
            labels:{fontSize:10}, 
            data: {fill: ({ datum }) => datum.Stroke, 
            fillOpacity: ({ datum }) => datum.Opacity, 

            size: ({ datum }) => datum.Size, 
            strokeWidth: ({ datum,active }) => active ? datum.StrokeWidth:datum.StrokeWidth*0.5 }} }
    /> 
    }

    function setGeneColor(Data,mySet,activeSet){
        var tempData = Data
        
        for( var geneInd in tempData){
            var gene = tempData[geneInd]
            if ( ( activeSet.includes(gene['geneSymbol']) &&  mySet.includes(gene['geneSymbol']) )){
                gene['Stroke'] = 'blue'
                gene['Size'] = 3
                gene['Opacity'] = 0.7
            }

            else if (mySet.includes(gene['geneSymbol'])){

                gene['Stroke'] = 'green'
                gene['Size'] = 3
                gene['Opacity'] = 0.7

            }
                
            else if (activeSet.includes(gene['geneSymbol'])){
                gene['Stroke'] = 'red'
                gene['Size'] = 3
                gene['Opacity'] = 0.7

            }
            
            else {
                gene['Stroke'] = 'gray'
                gene['Size'] = 1
                gene['Opacity'] = 0.5

            }
                    
        }

        if (allGenesFlag){
            setAllFlagColor(tempData)
        }
    }

    return(
        <Container>

            <div class="ui slider checkbox">
            <input type="checkbox" name="newsletter"
                    value={allGenesFlag}
                    onChange={handleToggleSwitch}></input>
            <label>Show all genes</label>
            </div>
 
            <VictoryChart>
                
                { getChartType() }
                
                <VictoryAxis 
                tickFormat={ ()=> ''} 
                style={{
                        axis:{stroke:"none",
                        grid: { stroke: "#818e99", strokeWidth: 0.5 }}}}
                />
                
                <VictoryAxis  
                    tickFormat={ ()=> ''}
                    dependentAxis={true} 
                    style={{axis:{stroke:"none"}, 
                            tickLabels:{size:10}}} 
                            />

                <VictoryLegend x={350} y={30}
                gutter={20}
                style={{ border: { stroke: "black" }, labels:{fontSize:10} }}
                colorScale={ getColors() }
                data={ getLegend() }
                />
               
                    
            </VictoryChart>

        </Container>         
    )
}