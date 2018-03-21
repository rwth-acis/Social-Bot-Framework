FROM gcr.io/tensorflow/tensorflow
MAINTAINER Alexander Tobias Neumann
EXPOSE 18080
# Install OpenJDK 8
RUN apt-get install -y --no-install-recommends software-properties-common
RUN add-apt-repository -y ppa:openjdk-r/ppa
RUN apt-get update
RUN apt-get install -y openjdk-8-jdk
RUN apt-get install -y openjdk-8-jre
RUN update-alternatives --config java
RUN update-alternatives --config javac
RUN apt-get install -y wget
RUN apt-get install -y git
# Installs Ant
ENV ANT_VERSION 1.10.2
RUN cd && \
    wget -q http://www.us.apache.org/dist//ant/binaries/apache-ant-${ANT_VERSION}-bin.tar.gz && \
    tar -xzf apache-ant-${ANT_VERSION}-bin.tar.gz && \
    mv apache-ant-${ANT_VERSION} /opt/ant && \
    rm apache-ant-${ANT_VERSION}-bin.tar.gz
ENV ANT_HOME /opt/ant
ENV PATH ${PATH}:/opt/ant/bin
COPY cnn-text-classification-tf/ cnn-text-classification-tf/
COPY las2peer-TensorFlow-Classifier/ las2peer-TensorFlow-Classifier/
WORKDIR /notebooks/las2peer-TensorFlow-Classifier/
RUN exec ant all
ENTRYPOINT exec sh bin/start_network.sh