import React, { useRef } from 'react';
import {GeneSetRow} from './GeneSetRow';
import {Container} from 'semantic-ui-react';
import './css/GeneSetTable.css'

export const GeneSetTable = ({pairWiseData, setActiveSet, setPairWiseData, querySet}) =>{

    const pairWiseDataRef = useRef([])
    pairWiseDataRef.current = pairWiseDataRef;

    const renderGeneSetRow = (geneSet) => {
        return(
        <GeneSetRow geneSet = {geneSet}
                    setActiveSet = {setActiveSet}
                    pairWiseData={pairWiseData}
                    setPairWiseData={setPairWiseData}
                    querySet={querySet}/>
        )
    }
    // console.log('GeneSetTable: ')
    // console.log(pairWiseData);

    return(
        <Container id='GeneSetTable'>
            <table class="ui small table" id='GeneSetTableHTML' >
                <thead>
                    <tr><th>Score</th>
                    <th>Geneset Name</th>
                    <th>Descritpion</th>
                    <th>P-Value</th>
                </tr></thead>
                <tbody>
                    {Object.values(pairWiseData).map(renderGeneSetRow)}
                </tbody>
            </table>
        </Container>
    )
}