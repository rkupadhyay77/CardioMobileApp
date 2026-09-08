//
//  NotificationHandeler.m
//  Cardio
//
//  Created by Rajeev Upadhyay on 24/03/22.
//

#import "NotificationHandeler.h"
@implementation NotificationHandeler
RCT_EXPORT_MODULE();


RCT_EXPORT_METHOD(checkForLaunchNotification: launchOption:(RCTResponseSenderBlock)callback){
  NSLog(@"launchOptions-----given %@",[[NSUserDefaults standardUserDefaults] objectForKey:@"launchOptions"]);
callback(@[ [[NSUserDefaults standardUserDefaults] objectForKey:@"launchOptions"]]);
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getLaunchOption)
{
return [[NSUserDefaults standardUserDefaults] objectForKey:@"launchOptions"];
}
  
@end
