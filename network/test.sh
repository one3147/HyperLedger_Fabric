export PATH=${HOME}/fabric-samples/bin:$PATH
export BasicPATH=${HOME}/fabric-samples/test-network
export FABRIC_CFG_PATH=${HOME}/fabric-samples/config

## Peer config
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${BasicPATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${BasicPATH}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
## connection info config
ORDERER_CA=${BasicPATH}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
PEER_CONN_PARMS="--peerAddresses localhost:7051 --tlsRootCertFiles ${BasicPATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${BasicPATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

echo "TEST1: Invoking the chaincode"
set -x
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C mychannel -n basic $PEER_CONN_PARMS -c '{"function": "InitUser", "Args":[]}' > log.txt 2>&1
{ set + x; } 2> /dev/null
cat log.txt
sleep 3
set -x
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C mychannel -n basic $PEER_CONN_PARMS -c '{"function": "FindUser", "Args":["admin"]}' > log.txt 2>&1
{ set + x; } 2> /dev/null
cat log.txt
sleep 3
set -x
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C mychannel -n basic $PEER_CONN_PARMS -c '{"function": "PlayGame", "Args":["admin","10000","2"]}' > log.txt 2>&1
{ set + x; } 2> /dev/null
cat log.txt
sleep 3

echo "TEST2: Query the Chaincode"
set -x
peer chaincode query -C mychannel -n basic -c '{"Args":["InitUser"]}' > log.txt
{ set + x; } 2> /dev/null
cat log.txt
