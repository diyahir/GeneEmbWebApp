import React, {useState, useRef } from 'react'
import {Form, Input, Dropdown, Button, Container, Popup} from 'semantic-ui-react';
import './css/DataInput.css';
import 'semantic-ui-css/semantic.min.css'
import { CSVLink } from "react-csv";
import { Collapse } from '@material-ui/core';

export const DataInput = ({setPairWiseData, setLoading, setGeneData, 
    geneSet, setGeneSet, databases,
    setReleventGeneData,pairWiseData}) =>{

    const [errorFound, setErrorFound] = useState(false)
    const [invalidGenes, setInvalidGenes] = useState('')

    const [activeEmbedding, setActiveEmbedding ] = useState(1);
    const [activeMetric, setActiveMetric ] = useState(4);
    const [activeDBs, setActiveDBs ] = useState([]);

    const [customGmtFile, setCustomGmtFile] = useState([]);

    const geneSetRef = useRef([]);
    geneSetRef.current = geneSet;

    const Metric = [
        {text:'Cosine Similarity - Centroids', value:4},
        {text:'Cosine Similarity',value:3},
        {text:'2-Norm-Centroid', value:1},
        {text:'2-Norm',value:3}
    ]

    const Embeddings = [
        {text:'CBOW', value:1},
        {text:'Gene2Vec', value:2}
    ]

    function handleDBChange(e, {value} ){
        setActiveDBs(value)
    }

    function handleMetricChange(e, {value}){
        setActiveMetric(value)
    }

    function handleEmbeddingChange(e, {value}) {
        setActiveEmbedding(value)
    }

    function handleGmtFileUpload(e){
        // console.log(e)
        var reader = new FileReader();

        reader.onload = function(event) {
            var contents = event.target.result;
            setCustomGmtFile(contents)
        };

        reader.readAsText(e.target.files[0])

        // console.log('Tried to upload file')
        // console.log(e.target.files[0])
        // setCustomGmtFile(value)
    }

    function handleSampleRun(){

        setActiveDBs([0])
        setGeneSet("PRKCI,CRK,NCK2,F2RL2,PTPN1,GRB14,FOXO3,EIF4EBP1,SH2B2,EXOC7,CBL,EXOC4,PIK3R1,PTPRA,AKT2,IRS1,RHOQ,EXOC3,NCK1,DOK1,INSR,PIK3CA,RPS6KB1,PTPN11,INPP5D,PARD6A,EXOC6,EXOC5, TRIP10,HRAS,EXOC2,RAPGEF1,SOS1,GRB2,AKT1,SGK1,GRB10,INS,PDPK1,RASA1,SHC1,CAV1,PRKCZ,SORBS1,EXOC1")
        
        const tmpGeneset = "PRKCI,CRK,NCK2,F2RL2,PTPN1,GRB14,FOXO3,EIF4EBP1,SH2B2,EXOC7,CBL,EXOC4,PIK3R1,PTPRA,AKT2,IRS1,RHOQ,EXOC3,NCK1,DOK1,INSR,PIK3CA,RPS6KB1,PTPN11,INPP5D,PARD6A,EXOC6,EXOC5, TRIP10,HRAS,EXOC2,RAPGEF1,SOS1,GRB2,AKT1,SGK1,GRB10,INS,PDPK1,RASA1,SHC1,CAV1,PRKCZ,SORBS1,EXOC1"
        const tmpActiveDBs = [0]

        // Have to pass in temp vars because sometimes you cannot immediately access newly set states due to async
        // so just pass and set and should be good. 

        handleRunData(tmpGeneset,tmpActiveDBs,'')
        
    }
    function getInvalidGenesLi(){
        if (errorFound){
            var invalidGenesLi
            invalidGenesLi = invalidGenes.map(function (invalidGene) {
                return  invalidGene + ', ';
            }).join('');
            return invalidGenesLi.slice(0,-2)
        }
        return ''
    }

    async function handleRunData(geneSet,activeDBs,gmtFile){

        setErrorFound(false);

        const request = {
            geneSet: geneSet,
            embedding: activeEmbedding,
            metric: activeMetric,
            databases: activeDBs,
            file: `${gmtFile}`
        }
        setLoading(true);

        const response = await fetch('/getPairWiseData', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        })

        if (response.ok){
            response.json().then( data=> {
                const errorCase = JSON.parse(data['Error'])

                if (errorCase === 0){
                    // All genes are good
                    setPairWiseData(JSON.parse(data['pairWiseData']))
                    setReleventGeneData(JSON.parse(data['releventGeneData']))
                    setGeneData(JSON.parse(data['genesData']))      
                    // console.log(pairWiseData)
                }
                else if(errorCase === 1){
                    // Contains some invalid genes 
                    setPairWiseData(JSON.parse(data['pairWiseData']))
                    setReleventGeneData(JSON.parse(data['releventGeneData']))
                    setGeneData(JSON.parse(data['genesData']))  
                    setInvalidGenes(data['InvalidGenes'])
                    setErrorFound(true)
                }
                else if(errorCase === 2){
                    // No genes are valid 
                    setInvalidGenes(data['InvalidGenes'])
                    setErrorFound(true)
                }
            })
        }
        setLoading(false)

        // TODO: Handle errors in genes inputted 
    }

    return(
        <Container>
            <Form >
                <Form.Group widths='equal' id='Parameters'>

                        <Popup position="top center" trigger={ 
                        <Form.Field control={Input} placeholder='Gene Set' value={geneSet}
                        onChange= {e => setGeneSet(e.target.value)}>

                        </Form.Field>} > Enter the geneset you are interested in comparing ( either as a comma delimited list or as a gene per line ).

                        </Popup>

                        <Form.Field>
                            <Dropdown placeholder = 'Similarity Metric'
                            selection
                            fluid
                            value = {activeMetric}
                            onChange = { handleMetricChange }
                            options = { Metric }/>
                        </Form.Field>

                        <Form.Field>
                            <Dropdown placeholder = 'Embedding'
                            selection
                            value = {activeEmbedding}
                            options = { Embeddings }
                            onChange = { handleEmbeddingChange }/>
                        </Form.Field>
                    </Form.Group>

                    <Form.Group >

                        <Form.Field>
                            <Dropdown placeholder='All Databases' 
                            multiple 
                            selection 
                            value = { activeDBs }
                            onChange = { handleDBChange }
                            options={ databases } />
                        </Form.Field> 
                        
                       
                        <Popup position="top center" trigger={ 
                            <Form.Field>
                                <input type="file" id="file" accept='.gmt' onChange = { handleGmtFileUpload }></input>

                            </Form.Field>
                        } > OPTIONAL: Upload your own gene symbol annotated GMT file for which to compare your query. 
                        </Popup>
                        
                        <Popup position="top center" trigger={  
                        <Form.Field>
                            <Button onClick={ handleSampleRun }>Sample Run</Button>
                        </Form.Field>
                        } > We will demonstrate an example of how to use this tool using the PID_INSULIN_PATHWAY geneset. 

                        </Popup>

                        <Form.Field>
                        <Button class="ui button" onClick={ ()=> handleRunData(geneSet,activeDBs,customGmtFile) }>
                            <i class="play icon"></i>
                            Run Analysis
                        </Button>
                        </Form.Field>

                        <Form.Field>
                            <Button><CSVLink filename={'GeneSetScores.csv'} data={pairWiseData}> <i class="save icon"></i> Download Results</CSVLink></Button>
                        </Form.Field>
                    </Form.Group>

                        
            </Form>
            <Collapse in={errorFound} mountOnEnter={true}>
                <div class="ui error message">
                <div class="header">
                    There were some errors with your submission
                </div>
                <p >The following genes are unsupported by this embedding and were removed from the set: </p>
                <ul class="list">
                    { getInvalidGenesLi() }
                </ul>
                </div>
            </Collapse>
            
        </Container>
    )
}