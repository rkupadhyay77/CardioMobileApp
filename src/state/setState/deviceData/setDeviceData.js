import Device from './device'

export default function setDeviceData(res){
  var array = []

  for(var index = 0 ; index < res.length ; index++){
    
      let horesedata = res[index].horesedata

      let rr = horesedata.rr;
      let devid =  horesedata.devid;
      let vlfpw = vlfpw;
      let hr =  horesedata.hr;
      let lfhf = horesedata.lfhf;
      let rmssd = horesedata.rmssd;
      let mot = horesedata.mot;
      let rrbpss =  horesedata.rrbpss;
      let hr3bpss = horesedata.hr3bpss;
      let hrss =  horesedata.hrss;
      let ctemp = horesedata.ctemp;
      let avghr2 = horesedata.avghr2;
      let hr1bpss = horesedata.hr1bpss ;
  
      let stdP2P = horesedata.stdP2P;
      let hr1 =  horesedata.hr1;
      let hr3 = horesedata.hr3;
      let avgp2p = horesedata. avgp2p;
      let hr2 = horesedata.hr2;
      let hr2bpss = horesedata.hr2bpss;
      let pnnxx = horesedata.pnnxx;
      let lfpw =  horesedata.lfpw;
      let nnxx = horesedata.nnxx;
      let hfpw =  horesedata.hfpw;
      let cfreq = horesedata.cfreq;
      let sdcnt = horesedata.sdcnt;
      let time = horesedata.time ;
      
      let DeviceData = new Device(rr,devid,vlfpw,hr,lfhf,rmssd,mot,rrbpss,rrss,hr3bpss,hrss,ctemp,avghr2,hr1bpss,stdP2P,hr1,hr3,avgp2p,hr2,hr2bpss,pnnxx,lfpw,nnxx,hfpw,cfreq,sdcnt,time)

      array.push(DeviceData)
  }

  return array

}