import { NavigationContainer } from '@react-navigation/native';
import Elber from './Elber';
import { GlobalProvider } from '../store/GlobalProvider'

function App() {  
  return (
    <GlobalProvider>
      <NavigationContainer>
        <Elber />
      </NavigationContainer>
    </GlobalProvider>
  );
}

export default App;
