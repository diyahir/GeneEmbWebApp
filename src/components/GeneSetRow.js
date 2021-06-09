import React, {useState, useRef} from 'react';
import { Collapse } from '@material-ui/core';
import './css/GeneSetTable.css'

export const GeneSetRow = ({geneSet, setActiveSet, pairWiseData, setPairWiseData, querySet}) =>{


    const geneSetRef = useRef([]);
    geneSetRef.current = geneSet;

    // console.log(geneSet)
    const parsedRowGenes = geneSet.Genes.split(',')
    const parsedQueryGenes = querySet.split(',')

    // console.log(parsedRowGenes)
    // console.log(parsedQueryGenes)

    const  genesInBoth = []
    const genesUnique = []

    parsedRowGenes.forEach(checkMemeberShip)

    function checkMemeberShip(myGene){
        if( parsedQueryGenes.includes(myGene) ){
            genesInBoth.push(myGene)
        }
        else{
            genesUnique.push(myGene)
        }
    }
    
    
    const [open, setOpen] = useState(false)
    
    function getRoundedScore(score){
        var tempNum = parseFloat(score).toFixed(3)
        return tempNum

    }

    function handleRowClick(){
        setOpen(!open)
        setActiveSet(geneSet.Genes)
        var tempCopyPairWiseData = pairWiseData;

        // Resetting highlighted color when active
        for (var ind in tempCopyPairWiseData){
          tempCopyPairWiseData[ind]['Stroke'] = 'green';
        }

        tempCopyPairWiseData[geneSet.Index]['Stroke'] = '#FF7800';

        setPairWiseData(tempCopyPairWiseData)   
    }

    function geneSetToString(geneSetArr){
        var geneSetString = ''
        geneSetString = geneSetArr.join(', ')

        return geneSetString
    }

    return(
        <>
            <tr onClick={handleRowClick}> 
                <td>{getRoundedScore(geneSet.Score)}</td>
                <td>{geneSet.GeneSetName}</td>
                <td>{geneSet.GeneSetDescription}</td>
                <td>{geneSet.PVal.toExponential()}</td>
            </tr>

            <tr style={{ padding: 0}}>
                <td class='GeneSetRow' colspan="4">
                    <Collapse in={open} mountOnEnter={true}>
                            <h4>Genes shared with query: </h4>
                            <p > {geneSetToString(genesInBoth)} </p>
                            <h4>Genes unique to set: </h4>
                            <p> {geneSetToString(genesUnique)} </p>
                    </Collapse>
                </td>
            </tr>

        
        </>
       
        
    )
}

