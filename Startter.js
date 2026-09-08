import React from "react";
import AnimatedSplash from 'react-native-animated-splash-screen';
import NAV from './src/navigation';
import * as Sentry from "@sentry/react-native";

Sentry.init({
    dsn: "https://fff295ee731b84ea7bf0e65a094904a3@o4507294527717376.ingest.us.sentry.io/4507368780660736",
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
    _experiments: {
      // profilesSampleRate is relative to tracesSampleRate.
      // Here, we'll capture profiles for 100% of transactions.
      profilesSampleRate: 1.0,
    },
  });

class Starter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { timer: null, isLoaded: false,};
    }

    componentDidMount() {
        let timer = setInterval(this.tick, 2000);
        this.setState({timer});
    }

    tick = () => {
        this.setState({
          isLoaded: true,
        });
        // this.clearInterval(this.state.timer);
      };

    render() {
        return (
            <AnimatedSplash
        translucent={true}
        isLoaded={this.state.isLoaded}
        imageBackgroundSource={require('./src/img/Splash.png')}
        logoImage={require('./src/img/logo.png')}
        logoHeight={1}
        logoWidht={1}>
                <NAV></NAV>
            </AnimatedSplash>
        )
    }
}

export default Sentry.wrap(Starter);