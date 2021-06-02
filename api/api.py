import time
from flask import Flask,request
import scripts
import gensim
from gensim.models import KeyedVectors
import pandas as pd
from sklearn.decomposition import IncrementalPCA    # inital reduction
from sklearn.manifold import TSNE                   # final reduction
import numpy as np            
from sklearn.decomposition import PCA               # array handling
import os 

app = Flask(__name__)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}


@app.route('/getDatabases',methods=['POST','GET'])
def getDatabases():
    print('getting databases : ')

    WORKINGDIR = os.getcwd()
    DIRECTORY = WORKINGDIR+'/GMTDataBases'
    databaseDict = {}

    for ind,fileName in enumerate(os.listdir(DIRECTORY)):
        tempDict = {}
        if not fileName.startswith('.'): # Sometimes hidden files will break this '.DS_store'
            # databasesDict[ind] = fileName
            tempDict['value'] = ind
            tempDict['text'] = fileName
            databaseDict[ind] = tempDict

    return databaseDict

@app.route('/getPairWiseData',methods=['POST','GET'])
def getPairWiseData():
    # End point to recieve data to produce both Scoring Comparison plot and the TSNE plot

    data = request.get_json()

    MAXNUMOFSETSTOSEND = 50 # Larger number of sets causes a lot of lag, so keep this parameter less than 50 
    containsFile = False

    geneSetInput = parseInput(data['geneSet'])
    embedding = data['embedding']
    metric = data['metric']
    databases = data['databases']
    print('THIS IS A FILE: ')
    file = data['file'] 
    if file:
        containsFile = True
        
        
        
    # print(file)
    print('Starting PairWise Computations----------------------------------------')

    WORKINGDIR = os.getcwd()

    if embedding == 1:
        
        MODELPATH = WORKINGDIR+"/GeneVecModels/gene2vec_dim_v2_200_iter_60.model"
        model = KeyedVectors.load(MODELPATH)
        genesDf = pd.read_csv(WORKINGDIR+'/TSNEGeneLocations/CBOWTSNE.csv')

    if embedding == 2:
        gene2vecMODELPATH = WORKINGDIR+"/GeneVecModels/gene2vec_dim_200_iter_9_w2v.txt"
        model = gensim.models.KeyedVectors.load_word2vec_format(gene2vecMODELPATH)  
        genesDf = pd.read_csv(WORKINGDIR+'/TSNEGeneLocations/'+'2VECTSNE.csv')

    response = {}

    (someGenesValid,inValidGenes,validGenes) = genesValidInVocab(geneSetInput,model)
    if someGenesValid:
        geneSetInput = set(validGenes)
        # Getting genesets that are completely covered by genes in embedding
        [geneSets, namesInVocab, descirptionsInVocab] = scripts.getSetsInVocab(model,geneSetInput,databases,file)
        gsDistances = getGeneSetDistances(geneSetInput,geneSets,model,metric)

        df = pd.DataFrame(gsDistances,columns=['Score','PVal','IOU'])

        gsString = [ ','.join(list(tempGS)) for tempGS in geneSets]
        # print(gsString)
        
        df['GeneSetName'] = namesInVocab
        df['GeneSetDescription'] = descirptionsInVocab
        df['Genes'] = gsString
        df['Stroke'] = 'green'
        filter = df['IOU'] > 0
        df = df[filter]
        df =  df.sort_values(by = 'Score', ascending=False)
        df = df[:MAXNUMOFSETSTOSEND]

        numCols = df.shape[0]
        df['Index'] = range(numCols)

        pairWiseDf = df.to_json(orient='records')

        # Using genesets from df we get the genes in those dfs to then send to the client
        # for TSNE Plot

        genes = getGenesInDf(df)
        mask = genesDf['geneSymbol'].isin(list(genes))
        print(mask.shape)
        print('filtered df shape: ')

        genesDf['Relevant'] = 0
        
        genesDf.loc[mask,'Relevant'] = 1

        filteredGenesDf = genesDf[mask]
        print(filteredGenesDf.head())

        subSampleGeneDf = genesDf[:5000]

        print(filteredGenesDf.shape)
        filteredGenesDf['Stroke'] = 'gray'
        filteredGenesDf['StrokeWidth'] = 0.8

        response['Error'] = 0
        response['pairWiseData'] = pairWiseDf
        response['genesData'] = subSampleGeneDf.to_json(orient='records')
        response['releventGeneData'] = filteredGenesDf.to_json(orient='records')
        response['validGenes'] = validGenes

        if len(inValidGenes) > 0:
            response['InvalidGenes'] = inValidGenes
            response['Error'] = 1

        print('Completed-------------------------------------------------')
        return response
    else:
        response = {}
        response['InvalidGenes'] = inValidGenes
        response['Error'] = 2
        return response

def getGenesInDf(df):
    genes = df['Genes']
    setOfGenes = set()
    for setInDf in genes:
        # print(setInDf)
        tempSet = setInDf.split(',')
        # print(tempSet)
        # tempSet = eval(setInDf)
        for gene in tempSet:
            setOfGenes.add(gene)

    return setOfGenes 


def parseInput(data:str):
    data = data.replace(" ", "")
    data = data.replace("'", "")

    geneSet = set(data.split(','))
    return geneSet

def genesValidInVocab(geneSet:set, gensimModel):
    someGenesValid = 0
    inValidGenes = []
    validGenes = []
    for gene in geneSet:
        if gene not in gensimModel.wv.vocab:
            print('gene: not valid')
            print(gene)
            inValidGenes.append(gene)
        else:
            validGenes.append(gene)
            someGenesValid = 1

    return (someGenesValid,inValidGenes,validGenes)

def getGeneSetDistances(myGeneSet:set,geneSets:list,gensimModel, metric:int):
    distancesFromTest = [[scripts.getGeneSetDistance(myGeneSet,tempSet,metric,gensimModel),
                          scripts.getPValue(myGeneSet,tempSet), 
                          scripts.getInterSectPercentage(myGeneSet,tempSet)]  
                     for tempSet in geneSets]
    return distancesFromTest


def reduce_dimensions(model):
    num_dimensions = 2  # final num dimensions (2D, 3D, etc)

    # extract the words & their vectors, as numpy arrays
    vectors = np.asarray(model.wv.vectors)
    labels = np.asarray(model.wv.index2word)  # fixed-width numpy strings
    
    pca = PCA(n_components=30)
    pca.fit(vectors)
    vectors=pca.transform(vectors)    
    print('PCA Complete')
    # reduce using t-SNE
    tsne = TSNE(n_components=num_dimensions, random_state=0, perplexity=30)
    vectors = tsne.fit_transform(vectors)
    print('TSNE Complete')

    x_vals = [v[0] for v in vectors]
    y_vals = [v[1] for v in vectors]

    dfDict = {'X':x_vals, 'Y':y_vals, 'geneSymbol':labels}
    

    df = pd.DataFrame.from_dict(dfDict,orient='columns')
    df.to_csv('2VECTSNE.csv')
    print(df.head())

    return x_vals, y_vals, labels