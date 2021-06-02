import React, {useState, useEffect, useRef} from 'react';
import { Container } from 'semantic-ui-react';
import {Chart} from './Chart';
import { GeneSetTable } from './GeneSetTable';
import './css/DataDisplay.css';
import LoadingMask from 'react-loadingmask';
import "react-loadingmask/dist/react-loadingmask.css";
import { TSNEChart } from './TSNEChart';


export const DataDisplay = ({pairWiseData, 
    loading, setPairWiseData,
    geneData, geneSet, activeSet,setActiveSet, setGeneData,
    releventGeneData}) =>{
    return(
        <LoadingMask loading={loading} text={'Loading...'}>
            <Container id='DataDisplay'>
                
                <Chart setPairWiseData={setPairWiseData} 
                pairWiseData={pairWiseData} 
                loading={loading} 
                activeSet={activeSet}
                setActiveSet={setActiveSet}/>
                               
                <TSNEChart geneData={geneData} geneSet={geneSet} 
                activeSet={activeSet} setGeneData={setGeneData}
                releventGeneData={releventGeneData}/>

            </Container>
            <Container>
                <GeneSetTable pairWiseData={pairWiseData} 
                setActiveSet={setActiveSet} 
                setPairWiseData={setPairWiseData}
                pairWiseData={pairWiseData}
                querySet={geneSet}/>
            </Container>
        </LoadingMask>
    )
}