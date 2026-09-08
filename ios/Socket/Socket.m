//
//  Socket.m
//  Cardio
//
//  Created by Rajeev on 03/02/21.
//

#import "Socket.h"
#import <Foundation/Foundation.h>
//#import "GCDAsyncSocket.h"

#import <CocoaAsyncSocket/GCDAsyncSocket.h>

// When using Clang Modules:



@interface Socket ()<GCDAsyncSocketDelegate>

@property (nonatomic, strong) RCTResponseSenderBlock callback;
@property(nonatomic, strong)GCDAsyncSocket* socket;

@end

@implementation Socket

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(createConnect:(NSDictionary *)options callback:(RCTResponseSenderBlock)callback){

 self.callback = callback;
  
  NSString* ipAddress = @"192.168.10.1";
  NSString* portAddress = @"54709";
  
   self.wiFiSSID = [options objectForKey:@"wiFiSSIDName"];
  self.wiFiPassword = [options objectForKey:@"wiFiSSIDPassword"];
  
  self.socket = [[GCDAsyncSocket alloc] initWithDelegate:self delegateQueue:dispatch_get_main_queue()];
  [self.socket synchronouslySetDelegate:self];
  //delegate = self;
  
     NSError *err = nil;
  NSString* connectingToHost = @"Connecting to Host...";
  NSLog(@"delegate instance: %@",self.socket.delegate);

  NSLog(@"PrintDebugRK: %@",connectingToHost);
  //self.callback(@[connectingToHost]);
      if (![self.socket connectToHost:ipAddress onPort: [portAddress intValue] error:&err]) // Asynchronous!
      {
          // If there was an error, it's likely something like "already connected" or "no delegate set"
          NSLog(@"I goofed: %@", err);
        NSString* errorConnectingToHost = err.localizedDescription;
        self.callback(@[errorConnectingToHost]);
        
          return;
      }
  
  
//  CFStreamCreatePairWithSocketToHost(kCFAllocatorDefault, (__bridge CFStringRef) ipAddress, [portAddress intValue], &readStream, &writeStream);
//
//  NSLog(@"Setting up connection to %@ : %@", ipAddress, portAddress);
//
//
//  outputStream = (__bridge NSOutputStream *)writeStream;
//    inputStream = (__bridge NSInputStream *)readStream;
//
//    [outputStream setDelegate:self];
//    [inputStream setDelegate:self];
//
//    [outputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
//    [inputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
//
//    [outputStream open];
//    [inputStream open];
  
  
   NSLog(@"Prepairing command to send");
  

  
 
  
}

-(id)getCC{
  return [[NSUserDefaults standardUserDefaults] objectForKey:@"launchOptions"];
}

-(void)send{
  unichar le[2] = {'\r', '\n'};
       NSString *cLE = [NSString stringWithCharacters:(const unichar *) le length:2];

       NSString *command  = [NSString stringWithFormat:@"1:1.0%@2:%@%@3:%@%@0%@",cLE,self.wiFiSSID,cLE,self.wiFiPassword,cLE,cLE];
  NSLog(@"Sending command::::%@",command);
       NSData *data = [[NSData alloc] initWithData:[command dataUsingEncoding:NSUTF8StringEncoding]];
       [outputStream write:[data bytes] maxLength:[data length]];
  
  [self performSelector:@selector(sendCommandAfterFiveSeconnd) withObject:nil afterDelay:5.0];
}

-(void)sendCommandAfterFiveSeconnd{
    if (!self.isRecieved){
        unichar le[2] = {'\r', '\n'};
        NSString *cLE = [NSString stringWithCharacters:(const unichar *) le length:2];
         NSString *helloCommand  = [NSString stringWithFormat:@"HELLO%@0%@",cLE,cLE];
        NSData *data = [[NSData alloc] initWithData:[helloCommand dataUsingEncoding:NSUTF8StringEncoding]];
        [outputStream write:[data bytes] maxLength:[data length]];
    }
}


-(void)sendAcknowledgment{
        unichar le[2] = {'\r', '\n'};
        NSString *cLE = [NSString stringWithCharacters:(const unichar *) le length:2];
         NSString *helloCommand  = [NSString stringWithFormat:@"ACK%@0%@",cLE,cLE];
        NSData *data = [[NSData alloc] initWithData:[helloCommand dataUsingEncoding:NSUTF8StringEncoding]];
        [outputStream write:[data bytes] maxLength:[data length]];
    
}


- (void)stream:(NSStream *)theStream handleEvent:(NSStreamEvent)streamEvent {

  NSLog(@"stream event %lu", (unsigned long)streamEvent);

    switch (streamEvent) {

        case NSStreamEventOpenCompleted:
            NSLog(@"Stream opened");
        [self send];
            break;
        case NSStreamEventHasBytesAvailable:

            if (theStream == inputStream)
            {
                uint8_t buffer[1024];
                NSInteger len;

                while ([inputStream hasBytesAvailable])
                {
                    len = [inputStream read:buffer maxLength:sizeof(buffer)];
                    if (len > 0)
                    {
                        NSString *output = [[NSString alloc] initWithBytes:buffer length:len encoding:NSUTF8StringEncoding];

                        if (nil != output)
                        {
                            NSLog(@"server said: %@", output);
                          self.isRecieved = TRUE ;
                          if ([output isEqualToString:@"OK"]){
                            [self sendAcknowledgment];
                            sleep(2);
                            self.callback(@[output]);
                          }
                            
                          
                        }
                    }
                }
            }
            break;

        case NSStreamEventHasSpaceAvailable:
            NSLog(@"Stream has space available now");
            break;

        case NSStreamEventErrorOccurred:
               self.callback(@[[theStream streamError].localizedDescription]);
             NSLog(@"Error occured :::: %@",[theStream streamError].localizedDescription);
            break;

        case NSStreamEventEndEncountered:

         self.callback(@[@"stream closed"]);
            [theStream close];
            [theStream removeFromRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
            NSLog(@"close stream");
            break;
        default:
            NSLog(@"Unknown event");
    }

}

RCT_EXPORT_METHOD(close) {
    NSLog(@"Closing streams.");
    [inputStream close];
    [outputStream close];
    [inputStream removeFromRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
    [outputStream removeFromRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
    [inputStream setDelegate:nil];
    [outputStream setDelegate:nil];
    inputStream = nil;
    outputStream = nil;

}


-(void)sendNewCommand{
  unichar le[2] = {'\r', '\n'};
    NSString *cLE = [NSString stringWithCharacters:(const unichar *) le length:2];

  NSString *command  = [NSString stringWithFormat:@"1:1.0%@2:%@%@3:%@%@0%@",cLE,self.wiFiSSID,cLE,self.wiFiPassword,cLE,cLE];
  NSLog(@"Sending command::::%@",command);
  
  NSData *msg = [command dataUsingEncoding:NSUTF8StringEncoding];
  NSLog(@"Data Send: %@",msg);
  NSString* wifiInfo = @"Seding wifi info...";
  NSLog(@"PrintDebugRK: %@",wifiInfo);
//  self.callback(@[wifiInfo]);
  
  [self.socket writeData:msg withTimeout:-1 tag:1];
}

-(void)sendNewAcknowledgment{
        unichar le[2] = {'\r', '\n'};
        NSString *cLE = [NSString stringWithCharacters:(const unichar *) le length:2];
         NSString *ACKCommand  = [NSString stringWithFormat:@"ACK%@0%@",cLE,cLE];
       
  NSData *msg = [ACKCommand dataUsingEncoding:NSUTF8StringEncoding];
  NSLog(@"Data Send: %@",msg);
  NSString* acknowledge = @"Seding Acknowledge...";
  NSLog(@"PrintDebugRK: %@",acknowledge);
 // self.callback(@[acknowledge]);
  
  [self.socket writeData:msg withTimeout:-1 tag:2];
    
}

#pragma mark- Delegate

- (void)socket:(GCDAsyncSocket *)sender didConnectToHost:(NSString *)host port:(UInt16)port
{
    NSLog(@"Cool, I'm connected! with host: %@ onPort: %hu",host, port);
  NSString* connected = @"Sensor reached";
  //self.callback(@[connected]);
  NSLog(@"PrintDebugRK: %@",connected);
  
  NSLog(@"Now send the command to server");
  [self sendNewCommand];
    [self.socket readDataWithTimeout:-1 tag:0];
}

- (void)socket:(GCDAsyncSocket *)sock didWriteDataWithTag:(long)tag
{
    if (tag == 1)
        NSLog(@"message request sent");
    else if (tag == 2)
        NSLog(@"ACK request sent");
   
}

- (void)socket:(GCDAsyncSocket *)sender didReadData:(NSData *)data withTag:(long)tag
{
    NSLog(@"Received Data: %@",data);
    [self.socket readDataWithTimeout:-1 tag:0];

     NSString *msg = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
     NSLog(@"MSG: %@",msg);
    if ([msg containsString:@"OK"]){
        [self sendNewAcknowledgment];
      NSString* paired = @"Paired";
      self.callback(@[paired]);
    }else{
      self.callback(@[msg]);
    }
}
@end
