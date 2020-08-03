import UserProvider from '../context/userContext';
import {
  withTina,
  useScreenPlugin,
  useFormScreenPlugin,
  useForm,
  useLocalForm
} from 'tinacms';
import { useState, useEffect } from 'react';
import firebase from '../firebase/clientApp';

const fireDB = firebase.firestore();
console.log('useFormScreenPlugin', useFormScreenPlugin);

// 2. Define the screen plugin
const ScreenPlugin = {
  name: 'Site Settings',
  Component() {
    return <h1>This is a screen!</h1>;
  },
  Icon: () => <span>🦙</span>,
  layout: 'popup'
};
// Custom App to wrap it with context provider
function MyApp({ Component, pageProps }) {

  const [siteSettings, setSiteSettings] = useState({})
  let initialData = {}

  useEffect(() => {
    if (!fireDB) return
    /**
     * @Note
     * This had to go inside `useEffect`.
     * Before I did that, it was saying Promise pending.
     */
    fireDB
      .collection('settings')
      .doc('site')
      .get()
      .then(doc => {
        console.log('doc.data()', doc.data());

        initialData = doc.data()
        setSiteSettings(doc.data())
      });

    // You also have your firebase app initialized
  }, [fireDB]);

  const siteSettingsFields = [
    { name: 'title', label: 'Site Title', component: 'text' },
    { name: 'description', label: 'Site Description', component: 'text' }
    // { name: "published", label: "Publisehd", component: "toggle" },
    // { name: "body", label: "Body", component: "markdown" }
  ];
console.log('initialData', initialData);

  const [data, form] = useLocalForm({
    id: 'form-1',
    label: 'Site Settings T1',
    initialValues: initialData,
    fields: siteSettingsFields,
    onSubmit({ id, ...data }) {
      // if (!firestore) return;
      fireDB
        .collection("settings")
        .doc('site')
        .update(data)
        .then(a => console.log(a))
        .catch(e => console.log(e));
    },
  });
  console.log("MyApp -> data", data)

  // useScreenPlugin(ScreenPlugin)
  useFormScreenPlugin(form);

  return (
    <UserProvider>
      <pre>{JSON.stringify(siteSettings)}</pre>
      <h1>{data.title}</h1>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default withTina(MyApp, {
  enabled: true,
  sidebar: true
});
