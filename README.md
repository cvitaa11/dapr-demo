# Dapr, .NET Core and Kafka on Kubernetes

This demo will get you up and running with Dapr in a Kubernetes cluster. You will be deploying ASP.NET Core applications

## Prerequisites

This demo requires you to have the following installed on your machine:

- Kubernetes CLI [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Kubernetes cluster, such as [Minikube](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-minikube/) or [Docker Desktop](https://www.docker.com/products/docker-desktop)

Also, clone the repository and `cd` into the right directory:

```
git clone https://github.com/cvitaa11/dapr-demo
cd dapr-demo
```

## Step 1 - Setup Dapr on your Kubernetes cluster

The first thing you need is an RBAC enabled Kubernetes cluster. This could be running on your machine using Minikube/Docker Desktop, or it could be a fully-fledged cluser in Azure using [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/) or some other managed Kubernetes instance from different cloud vendor.

Once you have a cluster, follow the steps below to deploy Dapr to it. For more details, look [here](https://docs.dapr.io/getting-started/install-dapr/#install-dapr-on-a-kubernetes-cluster)

```
$ dapr init -k
⌛  Making the jump to hyperspace...
ℹ️  Note: To install Dapr using Helm, see here: https://docs.dapr.io/getting-started/install-dapr-kubernetes/#install-with-helm-advanced

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run `dapr status -k' in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

The `dapr` CLI will exit as soon as the kubernetes deployments are created. Kubernetes deployments are asyncronous, so you will need to make sure that the dapr deployments are actually completed before continuing.

## Step 2 - Setup Apache Kafka

The easiest way to setup Apache Kafka on your Kubernetes cluster is by using [Helm](https://helm.sh/) package manager. To install Helm on your development machine follow this [guide](https://helm.sh/docs/intro/install/).

```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release bitnami/kafka
```

## Step 3 - Setup Redis

Just like Apache Kafka, easy way to spin up Redis on your Kubernetes cluster is by using Helm.

```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release bitnami/redis
```

To verify the installation of Kafka and Redis run `kubectl get all` and you should see similiar output:

```
NAME                             READY   STATUS        RESTARTS   AGE
pod/my-release-kafka-0           1/1     Running       0          4h18m
pod/my-release-zookeeper-0       1/1     Running       0          4h18m
pod/redis-master-0               1/1     Running       1          23h
pod/redis-slave-0                1/1     Running       1          23h
pod/redis-slave-1                1/1     Running       1          23h

NAME                                    TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
service/kubernetes                      ClusterIP   10.96.0.1        <none>        443/TCP                      15d
service/my-release-kafka                ClusterIP   10.110.225.238   <none>        9092/TCP                     4h18m
service/my-release-kafka-headless       ClusterIP   None             <none>        9092/TCP,9093/TCP            4h18m
service/my-release-zookeeper            ClusterIP   10.99.95.252     <none>        2181/TCP,2888/TCP,3888/TCP   4h18m
service/my-release-zookeeper-headless   ClusterIP   None             <none>        2181/TCP,2888/TCP,3888/TCP   4h18m
service/redis-headless                  ClusterIP   None             <none>        6379/TCP                     23h
service/redis-master                    ClusterIP   10.111.109.148   <none>        6379/TCP                     23h
service/redis-slave                     ClusterIP   10.111.66.85     <none>        6379/TCP                     23h

NAME                                    READY   AGE
statefulset.apps/my-release-kafka       1/1     4h18m
statefulset.apps/my-release-zookeeper   1/1     4h18m
statefulset.apps/redis-master           1/1     23h
statefulset.apps/redis-slave            2/2     23h
```

## Step 4 - Create Dapr components in Kubernetes cluster

To deploy .NET Core publisher and consumer applications make sure you are positioned in the right directory and then apply Dapr YAML manifests.

```
cd dapr-components
kubectl apply -f .\kafka.yaml
kubectl apply -f .\redis.yaml
```

## Step 5 - Deploy .NET Core applications

To deploy .NET Core publisher and consumer applications make sure you are positioned in the right directory and then apply Kubernetes manifests.

```
cd dapr-components
kubectl apply -f .\publisher.yaml
kubectl apply -f .\consumer.yaml
```

## Apache Kafka client

To create a pod that you can use as a Kafka client run the following commands:

```
kubectl run my-release-kafka-client --restart='Never' --image docker.io/bitnami/kafka:2.7.0-debian-10-r100 --namespace default --command -- sleep infinity

kubectl exec --tty -i my-release-kafka-client --namespace default -- bash
```

PRODUCER:

```
kafka-console-producer.sh --broker-list my-release-kafka-0.my-release-kafka-headless.default.svc.cluster.local:9092 --topic newMessage
```

CONSUMER:

```
kafka-console-consumer.sh --bootstrap-server my-release-kafka.default.svc.cluster.local:9092 --topic newMessage --from-beginning
```

To delete all message from specific topic run command:

```
kafka-topics.sh --zookeeper my-release-zookeeper.default.svc.cluster.local:2181 --alter --topic TOPIC_NAME --config retention.bytes=1
```

## Redis client

To get your password run:

```
export REDIS_PASSWORD=$(kubectl get secret --namespace default redis -o jsonpath="{.data.redis-password}" | base64 --decode)
```

To connect to your Redis(TM) server:

1. Run a Redis(TM) pod that you can use as a client:

```
kubectl run --namespace default redis-client --rm --tty -i --restart='Never' \
    --env REDIS_PASSWORD=$REDIS_PASSWORD \
   --image docker.io/bitnami/redis:6.0.12-debian-10-r3 -- bash
```

2. Connect using the Redis(TM) CLI:

```
redis-cli -h redis-master -a $REDIS_PASSWORD
```
