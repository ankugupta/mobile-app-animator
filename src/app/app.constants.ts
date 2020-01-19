export const API_ENDPOINT = "http://ec2-15-206-51-194.ap-south-1.compute.amazonaws.com:8081/animator";
//export const API_ENDPOINT = "http://localhost:9988/animator";
export const PUBLISHER = "Pub0002_BerryGarden";
//http://ec2-15-206-51-194.ap-south-1.compute.amazonaws.com/animator/publisher/P2/books
export const BOOKS_URI = API_ENDPOINT + "/publisher/" + PUBLISHER + "/books";
export const JUGNU_VIDEOS_URI = API_ENDPOINT + "/publisher/" + PUBLISHER + "/videos";
export const MASTER_DATA_PUBLISHER_URI = API_ENDPOINT + "/masterData?publisherId=" + PUBLISHER;
export const API_VERSION = "v1";
export const OBJECT_SCAN_TIMEOUT_SECONDS = 60; 
export const VUFORIA_LICENSE = "AfwNugr/////AAABmXSkhi4Wc0y2k2u/t+KF1/iJ4ZMm1p1k8duNetuGt2xMVstBzN2aOC3aNkUMWuCQjUcdoluNVL+wkRqiden+ZsuveS8ccvkbGFZyPLexUsFBZrlrycv4c+O+tH6stLswQ8oh9mpwqFj09Kajfgr8Mabf40Y+QjtGffxa/Un93OMnULUCebsQVJVlY18GsUydNSSc5ijLmKqQpTLFp5xDWnSsVD3Pz9gE5z7Bvyv+2oI35uccwY/gEsKQhHs4oCbgESgTqMyTxvICvQO4vYEljmt3Ac4g4CQjVZcttQiAiRLxTDFcfY0xxORaXc9CltcVq4TWrviKRKAZsqDMLz2eOepHdHI42gpCfIJHDGnfMpTF";
export const AR_WARNING_MSG = "Please be aware of any potential physical hazards around you while using the camera to scan a book.<br>Parental supervision is suggested for children of all ages.";
export const AR_WARNING_TITLE = "Safety First";
export const MD_TYPE_CLASS_ORDERING = "CLASS_ORDERING";