export default function DeviceInfo(sdnnEnabled,rmssdEnabled,rrMin,rrMax,name,sdnnMax,sdnnMin,hrMin,hrMax,devid,rrEnabled,hrEnabled,customer,position){
    
    this.sdnnEnabled = sdnnEnabled;
    this.rmssdEnabled =  rmssdEnabled;
    
    this.rrMin = rrMin;
    this.rrMax = rrMax;
    
    this.sdnnMax =  sdnnMax;
    this.sdnnMin =  sdnnMin;

    this.name = name;

    this.hrMin = hrMin;
    this.hrMax = hrMax;
   
    this.devid = devid;


    this.rrEnabled =  rrEnabled;
    this.hrEnabled = hrEnabled;
    this.customer =  customer;
    this.position = position;

  
};