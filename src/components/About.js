import React from 'react';
import './css/About.css'
import CosineSimilarityImage from '../assets/CosineSimilarity.png'
import EmbeddingComparisonImage from '../assets/EmbeddingComparison.png'
import DistanceForumlaImage from '../assets/DistanceFormula.gif'
import DistanceFinalImage from '../assets/DistanceFinal.gif'
import ExperimentComparisonImage from '../assets/ExperimentComparison.png'

const About = () => {
    return (
       <div id='AboutPage'>
          <h1>Introduction</h1>
          <p>The goal of this project and tool is to bring to life gene embeddings. In particular, 
             we created a knowledge-based gene embedding using a Continuous Bag-of-Words NLP model. This model
             performs better than the previously released Gene2Vec model in several gene embedding benchmarks.             
          </p>
          <p>
             Often when comparing two genesets one uses the Hypergeometric test to quantify the similarity of these two genesets.
             The Hypergeometric test is gene agnostic and so to better quantify the similarity of two genesets we need to 
             use a gene conscious approach. Using the gene embedding, we are able to formulate a function to compare two genesets.
             This metric is meant to compliment the hypergeometric test. 
          </p>
          <h1>Embedding Creation</h1>
            <p>
            We created embeddings using gensim’s NLP python package. This embedding will be based on the filtered gene sets described 
            previously. We will search for the best embedding dimension and performer. To that end we generated embeddings of sizes 50,100,150, 
            and 200 saving every 5th training epoch. To train the embedding we used the genesets contained in the following databases: 
            </p>
            <ol>
               <li>pathway25y.gmt</li>
               <li>hsapiens_pathway_Wikipathway_genesymbol.gmt</li>
               <li>hsapiens_pathway_Reactome_genesymbol.gmt</li>
               <li>hsapiens_pathway_Panther_genesymbol.gmt</li>
               <li>hsapiens_pathway_KEGG_genesymbol.gmt</li>
               <li>hsapiens_network_CORUM_genesymbol.gmt</li>
               <li>hsapiens_geneontology_Molecular_Function_genesymbol.gmt</li>
               <li>hsapiens_geneontology_Cellular_Component_genesymbol.gmt</li>
               <li>hsapiens_geneontology_Biological_Process_genesymbol.gmt</li>
            </ol>
            <p>
            To validate which embedding is the best embedding, we need to formulate methods of comparing the performance of each embedding. 
            In this way we can choose the best one from the grid search of embedding dimension and number of training epochs. 
            </p>
            <p>
            The pathway cosine similarity is defined by taking all the genes in a given pathway then finding each pairwise cosine similarity. 
            Then, you take random genes and find all the pairwise cosine similarities. The idea being that a good embedding will put genes in 
            the same pathway near each other. The pathways are taken from msigdb.v6.1.symbols.gmt. There is an overlap of 0.83% of the pathways 
            in msigdb.v6.1.symbols.gmt with the post processed gene sets we used to train the embedding.
            </p>
            <img src={CosineSimilarityImage}></img>
            <p>
               Below you can see a TSNE plot of our model (CBOW) vs Gene2Vec both visualizing the genes related to arthritis.
            </p>
            <img src={EmbeddingComparisonImage}></img>

          <h1>Similarity Metric Forumlation</h1>
          <p>
            Having generated an embedding that captures some knowledge of the genes, we can now begin to forumalte 
            a method for comparing two gene sets. The idea behind this comparison is to reward gene sets for having 
            overlapping genes and to quantitively capture the similarity of two sets. 
          </p>

          <img src={DistanceForumlaImage}></img>
          <p></p>
          <img src={DistanceFinalImage}></img>
          <p>Here distance function is mean to to be generic, but in our usecase we use the cosine similarity function 
             as it is widely used in NLP word embeddings to compare words.
          </p>
         <h1>Similarity Metric Validation</h1>
         <p>
            To validate the Metric, we formulated an experiment to determine the effectivness of the Metric and Embedding. 
            Given that the P-Values genesets (GS) are equal for genesets with the same intersection over union (IOU), 
            we want to highlight a situation in which using this heuristic geneset distance provides us with some advantage. 
            I will be using gene2vec for this experiment, more on this in the later parts. 
         </p>
         <p>
            To demonstrate this advantage, we first take a random GS and split it into two parts:
         </p>
         <p>
            Given the way we constructed A, A1, and B. The intersection over union of A1, A and A1, 
            B are equal. Consequently, their hypergeometric p values are also equivalent despite B 
            being constructed in a random fashion. We now take their pairwise heuristic geneset distances 
            (HGSD) and compare. If we repeat this process thousands of times we can start to see a pattern. 
            The HGSDs of the curated GS are almost always smaller than the HGSD of the partially randomly 
            constructed GS, B.
         </p>
         <img src={ExperimentComparisonImage}></img>

          <h1>Contact</h1>
            <p>Diyahir Campos: <a href = "mailto: DiyahirC@Gmail.com">Diyahirc@Gmail.com</a> </p>
            <p>Dr. Bing Zhang:  <a href = "mailto: Bing.Zhang@Bcm.com">Bing.Zhang@Bcm.com</a>   </p>
            <p>Dr. Yuxing Liao:  <a href = "mailto: Yuxing.Liao@Bcm.com">Yuxing.Liao@Bcm.com</a>   </p>

       </div>
    );
}
 
export default About;