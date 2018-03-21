# -*- coding: utf-8 -*-
"""
Created on Sun May  1 11:40:54 2016

@author: rahulkumar
"""

import numpy as np
import re
import itertools
from collections import Counter


def clean_str(string):
    """
    Tokenization/string cleaning for all datasets except for SST.
    Original taken from https://github.com/yoonkim/CNN_sentence/blob/master/process_data.py
    """
    string = re.sub(r"[^A-Za-z0-9(),!?\'\`]", " ", string)
    string = re.sub(r"\'s", " \'s", string)
    string = re.sub(r"\'ve", " \'ve", string)
    string = re.sub(r"n\'t", " n\'t", string)
    string = re.sub(r"\'re", " \'re", string)
    string = re.sub(r"\'d", " \'d", string)
    string = re.sub(r"\'ll", " \'ll", string)
    string = re.sub(r",", " , ", string)
    string = re.sub(r"!", " ! ", string)
    string = re.sub(r"\(", " \( ", string)
    string = re.sub(r"\)", " \) ", string)
    string = re.sub(r"\?", " \? ", string)
    string = re.sub(r"\s{2,}", " ", string)
    return string.strip().lower()


def load_data_and_labels():
    """
    Loads MR polarity data from files, splits the data into words and generates labels.
    Returns split sentences and labels.
    """
    # Load data from files
    html_examples = list(open("corpus/qa_data.html", "r").readlines())
    html_examples = [s.strip() for s in html_examples]
    
    mysql_examples = list(open("corpus/qa_data.mysql", "r").readlines())
    mysql_examples = [s.strip() for s in mysql_examples]
    
    php_examples = list(open("corpus/qa_data.php", "r").readlines())
    php_examples = [s.strip() for s in php_examples]

    java_examples = list(open("corpus/qa_data.java", "r").readlines())
    java_examples = [s.strip() for s in java_examples]

    
    # Split by words
    x_text = html_examples + mysql_examples + php_examples + java_examples 
    x_text = [clean_str(sent) for sent in x_text] 
    x_text = [s.split(" ") for s in x_text] 
    # Generate labels
    html_labels =  [[1, 0, 0, 0] for _ in html_examples]
    mysql_labels = [[0, 1, 0, 0] for _ in mysql_examples]
    php_labels = [[0, 0, 1, 0] for _ in php_examples]
    java_labels = [[0, 0, 0, 1] for _ in java_examples]
    
    
    y = np.concatenate([html_labels, mysql_labels,php_labels,java_labels], 0)
    return [x_text, y]

def processLabel(label):
    if label=="html":
        return [1, 0, 0, 0]
    elif label == "mysql":
        return [0, 1, 0, 0]
    elif label == "php":
        return [0, 0, 1, 0]
    elif label == "java":
        return [0, 0, 0, 1]
    else:
        return [1, 0, 0, 0]
        
def pad_sentences(sentences, padding_word="<PAD/>"):
    """
    Pads all sentences to the same length. The length is defined by the longest sentence.
    Returns padded sentences.
    """
    sequence_length = max(len(x) for x in sentences)
    padded_sentences = []
    for i in range(len(sentences)):
        sentence = sentences[i]
        num_padding = sequence_length - len(sentence)
        new_sentence = sentence + [padding_word] * num_padding
        padded_sentences.append(new_sentence)
    return padded_sentences
    
def pad_sentence(sentences, sentence, padding_word="<PAD/>"):
    """
    Pads all sentences to the same length. The length is defined by the longest sentence.
    Returns padded sentences.
    """
    sequence_length = max(len(x) for x in sentences)
    
    num_padding = sequence_length - len(sentence)
    new_sentence = sentence + [padding_word] * num_padding
    return new_sentence


def build_vocab(sentences):
    """
    Builds a vocabulary mapping from word to index based on the sentences.
    Returns vocabulary mapping and inverse vocabulary mapping.
    """
    # Build vocabulary
    word_counts = Counter(itertools.chain(*sentences))
    # Mapping from index to word
    vocabulary_inv = [x[0] for x in word_counts.most_common()]  
    vocabulary_inv = list(sorted(vocabulary_inv))  
    # Mapping from word to index
    vocabulary = {x: i for i, x in enumerate(vocabulary_inv)}  
    return [vocabulary, vocabulary_inv]


def build_input_data(sentences, labels, vocabulary):
    """
    Maps sentencs and labels to vectors based on a vocabulary.
    """
    x = np.array([[vocabulary[word] for word in sentence] for sentence in sentences])
    y = np.array(labels)
    return [x, y]


def load_data():
    """
    Loads and preprocessed data for dataset.
    Returns input vectors, labels, vocabulary, and inverse vocabulary.
    """
    # Load and preprocess data
    sentences, labels = load_data_and_labels() 
    sentences_padded = pad_sentences(sentences)
    vocabulary, vocabulary_inv = build_vocab(sentences_padded)
    x, y = build_input_data(sentences_padded, labels, vocabulary)
    return [x, y, vocabulary, vocabulary_inv] 

def load_data_online(sentence, label):
    """
    Loads and preprocessed data for dataset.
    Returns input vectors, labels, vocabulary, and inverse vocabulary.
    """
    # Load and preprocess data
    sentences, labels = load_data_and_labels()
    np.append(sentences,[sentence])
    l = processLabel(label)
    np.append(labels,[l])
    sentences_padded = pad_sentences(sentences)
    sentence = clean_str(sentence).split(" ")
    sentence_padded = pad_sentence(sentences,sentence)
    vocabulary, vocabulary_inv = build_vocab(sentences_padded)
    x, y = build_input_data([sentence_padded], labels, vocabulary)
    return [x, [l], vocabulary, vocabulary_inv] 
    
def batch_iter(data, batch_size, num_epochs, shuffle=True):
    """
    Generates a batch iterator for a dataset.
    """
    data = np.array(data)
    data_size = len(data)
    num_batches_per_epoch = int(len(data)/batch_size) + 1
    for epoch in range(num_epochs):
        # Shuffle the data at each epoch
        if shuffle:
            shuffle_indices = np.random.permutation(np.arange(data_size))
            shuffled_data = data[shuffle_indices]
        else:
            shuffled_data = data
        for batch_num in range(num_batches_per_epoch):
            start_index = batch_num * batch_size
            end_index = min((batch_num + 1) * batch_size, data_size)
            yield shuffled_data[start_index:end_index]

#x_test, y_test, vocabulary, vocabulary_inv = load_data()