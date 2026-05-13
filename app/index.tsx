import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Alert, BackHandler, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const ENDPOINT_URL = 'https://arknights-gacha.web.app/login';
const WEB_URL = 'https://arknights-gacha.web.app/';

const SERVER_MAP: Record<string, string> = {
  jp: 'https://account.yostar.co.jp',
  en: 'https://account.yo-star.com',
  kr: 'https://account.yostar.kr'
};

export default function Index() {
  const webviewRef = useRef<any>(null);
  const [hasIntercepted, setHasIntercepted] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Capture' | 'Website'>('Home');
  const [selectedServer, setSelectedServer] = useState<string>('jp');

  useEffect(() => {
    const backAction = () => {
      if (currentScreen !== 'Home') {
        setCurrentScreen('Home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  const injectedJavascript = `
    true;
  `;

  const onNavigationStateChange = (navState: any) => {
    if (currentScreen !== 'Capture') return;
    
    if (navState.url.includes('/user')) {
      const langMap: any = { 'en': 'en', 'kr': 'kr', 'jp': 'ja' };
      const targetLang = langMap[selectedServer] || 'ja';

      webviewRef.current?.injectJavaScript(`
        if (!window.__extraction_started) {
          window.__extraction_started = true;
          (async function() {
            try {
              const reqHeaders = { 'lang': '${targetLang}' };
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Checking login status...' }));
            const res = await fetch('/api/user/game-list', { headers: reqHeaders });
            if (!res.ok) throw new Error('API fetch failed');
            const data = await res.json();
            if (data.code !== 0) throw new Error('Not logged in or API code != 0');
            
            const ark = data.data.find(g => g.key === 'ark');
            if (!ark || !ark.playerInfo) throw new Error('No Arknights data found');
            const uid = ark.playerInfo.uid;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Logged in! UID: ' + uid + '. Fetching gacha types...' }));
            
            const typeRes = await fetch('/api/game/gacha-types?key=ark', { headers: reqHeaders });
            const typeData = await typeRes.json();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'typeData: ' + JSON.stringify(typeData) }));
            if (typeData.code !== 0) throw new Error('Failed to get gacha types');
            const types = typeData.data.types || [];
            
            let allLogs = [];
            
            for (let type of types) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Fetching pool type: ' + type }));
              let index = 1;
              let fetchedCount = 0;
              while (true) {
                const typeEncoded = encodeURIComponent(type);
                const pRes = await fetch('/api/game/gachas?key=ark&index=' + index + '&size=100&type=' + typeEncoded, { headers: reqHeaders });
                const pData = await pRes.json();
                if (pData.code !== 0) break;
                
                const rows = pData.data.rows || [];
                if (rows.length === 0) break;
                
                for (let item of rows) { item.time = item.atStr; }
                allLogs = allLogs.concat(rows);
                fetchedCount += rows.length;
                
                if (fetchedCount >= pData.data.count) break;
                index++;
                await new Promise(r => setTimeout(r, 200));
              }
              await new Promise(r => setTimeout(r, 200));
            }
            
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Successfully fetched ' + allLogs.length + ' logs!' }));
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'LOGS_FETCHED',
                uid: uid,
                logs: allLogs
            }));
            
          } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Error: ' + e.message }));
          }
        })();
        }
        true;
      `);
    }
  };

  const onMessage = (event: any) => {
    if (currentScreen !== 'Capture') return;

    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOG') {
        console.log('[WebView Log]:', data.message);
        return;
      }
      
      if (data.type === 'LOGS_FETCHED' && !hasIntercepted) {
        console.log('Got logs:', data.logs.length);
        setHasIntercepted(true);
        Alert.alert('Success', 'Extracted ' + data.logs.length + ' logs! Redirecting to analyzer...');

        const postScript = `
          var form = document.createElement("form");
          form.method = "POST";
          form.action = "${ENDPOINT_URL}";
          
          var uidField = document.createElement("input");
          uidField.type = "hidden";
          uidField.name = "uid";
          uidField.value = "${data.uid}";
          form.appendChild(uidField);

          var logsField = document.createElement("input");
          logsField.type = "hidden";
          logsField.name = "logs";
          logsField.value = decodeURIComponent("${encodeURIComponent(JSON.stringify(data.logs))}");
          form.appendChild(logsField);

          var methodField = document.createElement("input");
          methodField.type = "hidden";
          methodField.name = "method";
          methodField.value = "app_sync";
          form.appendChild(methodField);

          document.body.appendChild(form);
          form.submit();
        `;
        webviewRef.current?.injectJavaScript(postScript);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startCapture = (server: string) => {
    setSelectedServer(server);
    setHasIntercepted(false);
    setCurrentScreen('Capture');
  };

  const renderHome = () => {
    return (
      <View style={styles.homeContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.titleText}>Arknights Global Gacha Analyzer</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => startCapture('jp')}
          >
            <Text style={styles.primaryButtonText}>Start Capture (JP Server)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => startCapture('en')}
          >
            <Text style={styles.primaryButtonText}>Start Capture (EN Server)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => startCapture('kr')}
          >
            <Text style={styles.primaryButtonText}>Start Capture (KR Server)</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('Website')}
          >
            <Text style={styles.secondaryButtonText}>Go to Analyzer Website</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {currentScreen === 'Home' && renderHome()}

      {currentScreen === 'Capture' && (
        <WebView 
          ref={webviewRef}
          source={{ uri: SERVER_MAP[selectedServer] }} 
          style={styles.webview}
          injectedJavaScript={injectedJavascript}
          onMessage={onMessage}
          onNavigationStateChange={onNavigationStateChange}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
        />
      )}

      {currentScreen === 'Website' && (
        <WebView 
          source={{ uri: WEB_URL }} 
          style={styles.webview}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  titleWrapper: {
    marginVertical: 45,
    paddingVertical: 35,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    borderTopColor: '#1bd1fe',
    borderBottomColor: '#1bd1fe',
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#1bd1fe',
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#1bd1fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1bd1fe',
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1bd1fe',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

