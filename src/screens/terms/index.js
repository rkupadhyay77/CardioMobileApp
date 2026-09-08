import React, { Component , createRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'


import styles from './styles'
import HTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Feather'
 
const privacyPolicy = `
<Strong>This privacy policy discloses the privacy practices for Advanced Telesensors, Inc.</Strong>

This privacy policy applies solely to information collected by this web site. It will notify you of the following:

What personally identifiable information is collected from you through the web site, how it is used and with whom it may be shared.
What choices are available to you regarding the use of your data.
The security procedures in place to protect the misuse of your information.
How you can correct any inaccuracies in the information.
Information Collection, Use, and Sharing

We are the sole owners of the information collected on this site. We only have access to/collect information that you voluntarily give us via email or other direct contact from you. We will not sell or rent this information to anyone.

We will use your information to respond to you regarding the reason you contacted us. We will not share your information with any third party outside of our organization, other than as necessary to fulfill your request, e.g. to ship an order.

Unless you ask us not to, we may contact you via email in the future to tell you about specials, new products or services, or changes to this privacy policy.

Your Access to and Control Over Information

You may opt out of any future contacts from us at any time.

You can do the following at any time by contacting us via the email address or phone number given on our website:

See what data we have about you, if any.
Change/correct any data we have about you.
Have us delete any data we have about you.
Express any concern you have about our use of your data.
Security

We take precautions to protect your information. When you submit sensitive information via the website, your information is protected both online and offline.

Wherever we collect sensitive information (such as credit card data), that information is encrypted and transmitted to us in a secure way. You can verify this by looking for a closed lock icon at the bottom of your web browser, or looking for “https” at the beginning of the address of the web page.

While we use encryption to protect sensitive information transmitted online, we also protect your information offline. Only employees who need the information to perform a specific job (for example, billing or customer service) are granted access to personally identifiable information. The computers/servers in which we store personally identifiable information are kept in a secure environment.

`


const htmlContent = `
<myTag>
    <br> This Mobile App is operated by AdvancedTelesensors. Throughout the Mobile App, the terms “we”, “us” and “our” refer to <span>AdvancedTeles</span><span>ensors</span>. <span>AdvancedTeles</span><span>ensors</span> offers this Mobile App, including all information, tools and services available from this Mobile App to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here. <br> <br> By visiting our Mobile App and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the Mobile App, including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content. <br> <br> Please read these Terms of Service carefully before accessing or using our Mobile App. By accessing or using any part of the Mobile App, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the Mobile App or use any services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service. <br> <br> Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our Mobile App. It is your responsibility to check this page periodically for changes. Your continued use of or access to the Mobile App following the posting of any changes constitutes acceptance of those changes. <br> <br> Our store is hosted on Shopify Inc. They provide us with the online e-commerce platform that allows us to sell our products and services to you. <br> <br> <strong>SECTION 1 - ONLINE STORE TERMS</strong> <br> By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this Mobile App. <br> You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws). <br> You must not transmit any worms or viruses or any code of a destructive nature. <br> A breach or violation of any of the Terms will result in an immediate termination of your Services. <br> <br> <strong>SECTION 2 - GENERAL CONDITIONS</strong> <br> We reserve the right to refuse service to anyone for any reason at any time. <br> You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks. <br> You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the Mobile App through which the service is provided, without express written permission by us. <br> The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms. <br> <br> <strong>SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</strong> <br> We are not responsible if information made available on this Mobile App is not accurate, complete or current. The material on this Mobile App is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this Mobile App is at your own risk. <br> This Mobile App may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this Mobile App at any time, but we have no obligation to update any information on our Mobile App. You agree that it is your responsibility to monitor changes to our Mobile App. <br> <br> <strong>SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES</strong> <br> Prices for our products are subject to change without notice. <br> We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. <br> We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service. <br> <br> <strong>SECTION 5 - PRODUCTS OR SERVICES (if applicable)</strong> <br> Certain products or services may be available exclusively online through the Mobile App. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy. <br> We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate. <br> We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this Mobile App is void where prohibited. <br> We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected. <br> <br> <strong>SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION</strong> <br> We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e‑mail and/or billing address/phone number provided at the time the order was made. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers or distributors. <br> <br> You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed. <br> <br> For more detail, please review our Returns Policy. <br> <br> <strong>SECTION 7 - OPTIONAL TOOLS</strong> <br> We may provide you with access to third-party tools over which we neither monitor nor have any control nor input. <br> You acknowledge and agree that we provide access to such tools ”as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools. <br> Any use by you of optional tools offered through the Mobile App is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s). <br> We may also, in the future, offer new services and/or features through the Mobile App (including, the release of new tools and resources). Such new features and/or services shall also be subject to these Terms of Service. <br> <br> <strong>SECTION 8 - THIRD-PARTY LINKS</strong> <br> Certain content, products and services available via our Service may include materials from third-parties. <br> Third-party links on this Mobile App may direct you to third-party Mobile Apps that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or Mobile Apps, or for any other materials, products, or services of third-parties. <br> We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party Mobile Apps. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third-party. <br> <br> <strong>SECTION 9 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS</strong> <br> If, at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation (1) to maintain any comments in confidence; (2) to pay compensation for any comments; or (3) to respond to any comments. <br> We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion are unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party’s intellectual property or these Terms of Service. <br> You agree that your comments will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your comments will not contain libelous or otherwise unlawful, abusive or obscene material, or contain any computer virus or other malware that could in any way affect the operation of the Service or any related Mobile App. You may not use a false e‑mail address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any comments. You are solely responsible for any comments you make and their accuracy. We take no responsibility and assume no liability for any comments posted by you or any third-party. <br> <br> <strong>SECTION 10 - PERSONAL INFORMATION</strong> <br> Your submission of personal information through the store is governed by our Privacy Policy. To view our Privacy Policy. <br> <br> <strong>SECTION 11 - ERRORS, INACCURACIES AND OMISSIONS</strong> <br> Occasionally there may be information on our Mobile App or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related Mobile App is inaccurate at any time without prior notice (including after you have submitted your order). <br> We undertake no obligation to update, amend or clarify information in the Service or on any related Mobile App, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related Mobile App, should be taken to indicate that all information in the Service or on any related Mobile App has been modified or updated. <br> <br> <strong>SECTION 12 - PROHIBITED USES</strong> <br> In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the Mobile App or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related Mobile App, other Mobile Apps, or the Internet; (h) to collect or track the personal information of others; (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of the Service or any related Mobile App, other Mobile Apps, or the Internet. We reserve the right to terminate your use of the Service or any related Mobile App for violating any of the prohibited uses. <br> <br> <strong>SECTION 13 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY</strong> <br> We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free. <br> We do not warrant that the results that may be obtained from the use of the service will be accurate or reliable. <br> You agree that from time to time we may remove the service for indefinite periods of time or cancel the service at any time, without notice to you. <br> You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are (except as expressly stated by us) provided 'as is' and 'as available' for your use, without any representation, warranties or conditions of any kind, either express or implied, including all implied warranties or conditions of merchantability, merchantable quality, fitness for a particular purpose, durability, title, and non-infringement. <br> In no case shall Cardio-io, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility. Because some states or jurisdictions do not allow the exclusion or the limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law. <br> <br> <strong>SECTION 14 - INDEMNIFICATION</strong> <br> You agree to indemnify, defend and hold harmless Cardio-io and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys’ fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party. <br> <br> <strong>SECTION 15 - SEVERABILITY</strong> <br> In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions. <br> <br> <strong>SECTION 16 - TERMINATION</strong> <br> The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes. <br> These Terms of Service are effective unless and until terminated by either you or us. You may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, or when you cease using our Mobile App. <br> If in our sole judgment you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we also may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination; and/or accordingly may deny you access to our Services (or any part thereof). <br> <br> <strong>SECTION 17 - ENTIRE AGREEMENT</strong> <br> The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision. <br> These Terms of Service and any policies or operating rules posted by us on this Mobile App or in respect to The Service constitutes the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service). <br> Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party. <br> <br> <strong>SECTION 18 - GOVERNING LAW</strong> <br> These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of United States. <br> <br> <strong>SECTION 19 - CHANGES TO TERMS OF SERVICE</strong> <br> You can review the most current version of the Terms of Service at any time at this page. <br> We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our Mobile App. It is your responsibility to check our Mobile App periodically for changes. Your continued use of or access to our Mobile App or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes. <br> <br> <strong>SECTION 20 - CONTACT INFORMATION</strong> <br> Questions about the Terms of Service should be sent to us at <a class="btn--secondary" href="mailto:info@cardio.io">info@cardio.io</a><span>.</span><//myTag>
`;




export default class Terms extends Component{

    constructor(props){
        super(props)

       scrollOffset = 0
        scrolllHeight = 0
        completeHeight = 0
        movedTill = 0
    
       
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),isForTerms:props.navigation.state.params.isForTerms}
    }

    back(){
        this.props.navigation.goBack()
    }

    readMore(){
        //alert('scrollOffset'+this.scrollOffset)
       
        let height = this.scrolllHeight*0.8
        
        if (this.completeHeight !== undefined){
             if (this.movedTill + height  < this.completeHeight){
                height = this.movedTill + height
             }
        }


        this.scroller.scrollTo({x: 0, y: height});
        this.movedTill = height
    }
    render(){
        const {themeChanged,isForTerms} = this.state
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={isForTerms?'Legal Terms of use':'Privacy Policy'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
                 <View style={styles.viewContainer}>
                    <View style={styles.scrollContainer}>
                        <ScrollView 
                         ref={(scroller) => {this.scroller = scroller}}
                         style={{ flex : 1}}
                         onScroll={e => {
                            this.scrollOffset = e.nativeEvent.contentOffset.y;
                            this.completeHeight = e.nativeEvent.contentSize.height
                          }}
                          onLayout={e => {
                            this.scrolllHeight = e.nativeEvent.layout.height;
                            
                          }}
                          scrollEventThrottle={16}
                         >
                        <HTML html={isForTerms?htmlContent:privacyPolicy}  />
                        </ScrollView>
                     
                    </View>
                    <TouchableOpacity style={styles.boxContainer} onPress={()=> this.readMore()}>
                        <Text  allowFontScaling={false} allowFontScaling={false}style={styles.largeText}>Read More </Text>
                        <Icon name = {'chevrons-down'} color = {styles.largeText.color} size={styles.largeText.fontSize} />
                    </TouchableOpacity>  
            </View>
            </View>
        );
    }
}