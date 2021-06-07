import React, { useState } from 'react';
import { DataInput } from './DataInput';
import {DataDisplay} from './DataDisplay'

const Home = ( ) => {
    
  const [pairWiseData,setPairWiseData] = useState('');
  const [geneData,setGeneData] = useState([]);
  const [releventGeneData,setReleventGeneData] = useState([]);

  const [geneSet,setGeneSet] = useState('');
  const [loading,setLoading] = useState(false);
  const [activeSet, setActiveSet] = useState('');
  const [databases, setDatabases] = useState();

  
  if (databases === undefined || databases.length === 0){
    getDatabases()
  }

  async function getDatabases(){

    const response = await fetch('/api/getDatabases', {
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })


    if (response.ok){
        response.json().then( data=> {
            const tmpArray = Object.values(data)
            setDatabases(tmpArray)
        })
    }
  }

    return (
       <div>
        <DataInput 
        setPairWiseData={setPairWiseData} 
        setLoading={setLoading} 
        setGeneData={setGeneData}
        geneSet={geneSet}
        setGeneSet={setGeneSet}
        databases={databases}
        setReleventGeneData={setReleventGeneData}
        pairWiseData={pairWiseData}/> 
        
        <DataDisplay 
        setPairWiseData={setPairWiseData} 
        pairWiseData={pairWiseData} 
        loading={loading}
        geneData={geneData} setGeneData={setGeneData}
        geneSet={geneSet}
        activeSet={activeSet}
        setActiveSet={setActiveSet}
        releventGeneData={releventGeneData}
        />
       </div>
    );
}
 
export default Home;