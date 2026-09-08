//
//  Socket.h
//  Cardio
//
//  Created by Rajeev on 03/02/21.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN

@interface Socket : NSObject<RCTBridgeModule,NSStreamDelegate>{
  CFReadStreamRef readStream;
  CFWriteStreamRef writeStream;

  NSInputStream   *inputStream;
  NSOutputStream  *outputStream;
}

@property(nonatomic, assign) BOOL isRecieved;
@property(nonatomic, strong) NSString* wiFiSSID;
@property(nonatomic, strong) NSString* wiFiPassword;

@end

NS_ASSUME_NONNULL_END
