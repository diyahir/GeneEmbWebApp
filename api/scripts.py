import os
import pandas as pd
import numpy as np
from collections import Counter
from scipy import stats
import csv
import random
from sklearn.decomposition import PCA
import gensim 
from scipy.stats import hypergeom

def parseGeneSetFile(path:str,file:str):
    # Path: directory the current set
    # Parses one Geneset gmt file into list of sets 

    # Returns a list of genesets, gene Names and geneset descriptions
    
    geneSetList = []
    geneSetNames = []
    geneSetDiscriptions = []

    MINSETSIZE = 2
    
    if file:
        tempLines = file.splitlines()
        # print('File: ')
        # print(file[:100])

    else:
        tempFile = open(path,'r')
        tempLines = tempFile.readlines()


    for line in tempLines:
        # line = line.upper()
        line = line.strip('\n') 
        geneSetElements = line.split('\t') # first two entries are 'geneSet name' and 'discription'      
        genesInSet = geneSetElements[2:] 


        if len(genesInSet) >= MINSETSIZE: 
            # not interested in single-gene gene sets
            tempGeneSet = [x.upper() for x in genesInSet]
            geneSetList.append(set(tempGeneSet))
            geneSetNames.append(geneSetElements[0])
            geneSetDiscriptions.append(geneSetElements[1])

    return [geneSetList, geneSetNames, geneSetDiscriptions]


def getSetsInVocab(geneModel, myGeneSet,databases,file):
    
    # geneModel: loaded gensim word embedding model
    # myGeneSet: geneSet the user wishes to compare to DB

    geneSetList = []
    geneSetNames = []
    geneSetDiscriptions = []

    # TODO: change directory to relative directory

    print('databases: ')
    print(type(databases))
    print(databases)

    WORKINGDIR = os.getcwd()
    DIRECTORY = WORKINGDIR+'/GMTDataBases'

    for ind,fileName in enumerate(os.listdir(DIRECTORY)):
        if not fileName.startswith('.'): # Sometimes hidden files will break this '.DS_store'
            if ind in databases:
                tempPath = os.path.join(DIRECTORY, fileName)

                [tempGeneSet, tempGeneSetNames, tempGeneSetDiscriptions ] = parseGeneSetFile(tempPath,'')

                geneSetList = geneSetList + tempGeneSet
                geneSetNames = geneSetNames + tempGeneSetNames
                geneSetDiscriptions = geneSetDiscriptions + tempGeneSetDiscriptions
    
    # if user uploads custom gmt
    if file:
        [tempGeneSet, tempGeneSetNames, tempGeneSetDiscriptions ] = parseGeneSetFile('',file)

        geneSetList = geneSetList + tempGeneSet
        geneSetNames = geneSetNames + tempGeneSetNames
        geneSetDiscriptions = geneSetDiscriptions + tempGeneSetDiscriptions

    setsInVocab = []
    namesInVocab = []
    descirptionsInVocab = []
    
    for index in range(len(geneSetList)):
            geneSet = geneSetList[index]
            gsName = geneSetNames[index]
            gsDiscriptions = geneSetDiscriptions[index]

            allContainedFlag = 1 # make sure all the genes in the test set are in the vocab

            # TODO: Allow for all genesets but handle unknown genes by ignoring them 

            for gene in geneSet:
                if gene not in geneModel.wv.vocab:
                    allContainedFlag = 0
            if allContainedFlag:
                currentIOU = getInterSectPercentage(myGeneSet,geneSet)
                if currentIOU > 0: # Only compare to sets with intersection (time saving) and ignore same set
                    setsInVocab.append(geneSet)
                    namesInVocab.append(gsName)
                    descirptionsInVocab.append(gsDiscriptions)
    #             print(geneSet)
    print('Number of Genes in Emb  = {vocablen}'.format(vocablen=len(geneModel.wv.vocab)))
    print('Number of sets in vocab = {setInVcab}'.format(setInVcab = len(setsInVocab)))
    
    return [setsInVocab, namesInVocab, descirptionsInVocab]


def getPValue(sampleSet:set,functionalSet:set):
    # calculates hypergeometric test on pair of gene sets
    
    [M, n, N] = [24447, len(functionalSet), len(sampleSet)]
    rv = hypergeom(M, n, N)
    x = np.arange(0, n+1)
    pmfgenes = rv.pmf(x)
    
    interSet = sampleSet.intersection(functionalSet)
    
    cdf = []
    for ind in range(len(pmfgenes)):
        cdf.append(np.sum(pmfgenes[ind+1:]))
        
    return cdf[len(interSet)]


def getInterSectPercentage(set1:set,set2:set):
    percentIntersection = len(set1.intersection(set2))/len(set1.union(set2))
    return percentIntersection
    
    
def geneEmbDistance(gene1:str,gene2:str,geneModel) -> float:
    tempVec1 = geneModel.wv[gene1]
    tempVec2 = geneModel.wv[gene2]
    
    dist = np.linalg.norm(tempVec1-tempVec2)
    
    return dist

def getAvgVecSet(geneSet:set,geneModel):
    avgVec = np.zeros(200)
    
    for gene in geneSet:
        avgVec += geneModel.wv[gene]
    
    return avgVec/len(geneSet)


def geneSetDistance(geneSet1:set,geneSet2:set,case:int,geneModel):
    size1 = len(geneSet1)
    size2 = len(geneSet2)
    
    distance = 0
    
    # Pairwise Aproaches 
    for myGene in geneSet1:        
        if myGene not in geneSet2:
            tempVec = geneModel.wv[myGene]
            
            if case == 1: # 2-Norm Distance from centroid of comparison set
                centroid = getAvgVecSet(geneSet2,geneModel)
                tempDist = np.linalg.norm(tempVec-centroid)
                distance += tempDist
                
            if case == 2: # Minimum 2-Norm distance from 
                
                minDistance = float('inf')
                
                for dbGene in geneSet2:
                    dbGeneVec = geneModel.wv[dbGene]
                    tempDist = np.linalg.norm(tempVec-dbGeneVec)

                    if tempDist < minDistance:
                        minDistance = tempDist   
                                        
                distance += minDistance
        
            if case ==3: # Cosine Similarity to Centroid
                centroid = getAvgVecSet(geneSet2,geneModel)                
                dot = np.dot(centroid, tempVec)
                norma = np.linalg.norm(centroid)
                normb = np.linalg.norm(tempVec)
                
                distance  += dot / (norma * normb)
        else:
            if case == 3:
                distance += 1
                # add 1 for intersecting genes since this is a similarity based approach
    
    # Centroid approaches 
    if case == 4:
        # take set difference centroid and find cosine similarity with other set's centroid
        geneSetDifference = geneSet1.difference(geneSet2)
        if len(geneSetDifference) > 0:
            centroidDiff = getAvgVecSet(geneSetDifference,geneModel)
            centroidComp = getAvgVecSet(geneSet2,geneModel)

            dot = np.dot(centroidDiff, centroidComp)
            norma = np.linalg.norm(centroidDiff)
            normb = np.linalg.norm(centroidComp)

            distance  += dot / (norma * normb)
            
        distance += len(geneSet1.intersection(geneSet2))
    return distance/size1 # Normalizing by size 

def getGeneSetDistance(geneSet1:set,geneSet2:set,case:int,geneModel):
    forwardDirection = geneSetDistance(geneSet1,geneSet2,case,geneModel)
    backwardDirection = geneSetDistance(geneSet2,geneSet1,case,geneModel)
    return 0.5*(forwardDirection + backwardDirection)
