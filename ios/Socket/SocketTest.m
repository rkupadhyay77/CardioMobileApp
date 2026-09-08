//
//  SocketTest.m
//  Cardio
//
//  Created by Rajeev on 20/04/21.
//

#import "SocketTest.h"
#import <Foundation/Foundation.h>

#import <CocoaAsyncSocket/GCDAsyncSocket.h>


@interface SocketTest ()

@property (nonatomic, strong) RCTResponseSenderBlock callback;

@end
@implementation SocketTest


RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(createConnect:(NSDictionary *)options callback:(RCTResponseSenderBlock)callback){

  self.callback = callback;
  
  NSString* ipAddress = @"192.168.10.1";
  NSString* portAddress = @"54709";
  
   self.wiFiSSID = [options objectForKey:@"wiFiSSIDName"];
  self.wiFiPassword = [options objectForKey:@"wiFiSSIDPassword"];
  

  CFStreamCreatePairWithSocketToHost(kCFAllocatorDefault, (__bridge CFStringRef) ipAddress, [portAddress intValue], &readStream, &writeStream);

  NSLog(@"Setting up connection to %@ : %@", ipAddress, portAddress);


  outputStream = (__bridge NSOutputStream *)writeStream;
    inputStream = (__bridge NSInputStream *)readStream;

    [outputStream setDelegate:self];
    [inputStream setDelegate:self];

    [outputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
    [inputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];

    [outputStream open];
    [inputStream open];
  
  
   NSLog(@"Prepairing command to send");
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
                          if ([output containsString:@"OK"]){
                              [self sendAcknowledgment];
                            NSString* paired = @"Paired";
                            self.callback(@[paired]);
                          }else{
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

@end
