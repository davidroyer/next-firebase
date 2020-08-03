import Head from 'next/head';
import { useEffect } from 'react';
import { useUser } from '../context/userContext';
import firebase from '../firebase/clientApp';
import JSONPretty from 'react-json-pretty';
import {
  useForm,
  usePlugin,
  usePlugins,
  useCMS,
  useFormScreenPlugin
} from 'tinacms';
import { MarkdownFieldPlugin } from 'react-tinacms-editor';
import ReactMarkdown from 'react-markdown';

const fireDB = firebase.firestore();

export default function Home({
  page: initialPage,
  siteSettings: initialSiteSettings
}) {
  const cms = useCMS();
  // Our custom hook to get context values
  const { loadingUser, user } = useUser();

  useEffect(() => {
    if (!loadingUser) {
      // You know that the user is loaded: either logged in or out!
      console.log(user);
    }
    // You also have your firebase app initialized
  }, [loadingUser, user]);

  const pageFields = [
    { name: 'title', label: 'Title', component: 'text' },
    { name: 'body', label: 'Body', component: 'markdown' }
  ];

  const [page, form] = useForm({
    id: initialPage.id,
    label: 'Home Page',
    initialValues: initialPage,
    fields: pageFields,
    async onSubmit({ id, ...data }) {
      console.log('onSubmit -> id', id);
      await fireDB.collection('pages').doc('home').update(data);
      cms.alerts.success('Saved!');
    }
  });

  usePlugins(MarkdownFieldPlugin);
  usePlugin(form);

  const siteSettingsFields = [
    { name: 'title', label: 'Site Title', component: 'text' },
    { name: 'description', label: 'Site Description', component: 'text' }
  ];

  const [siteSettings, siteForm] = useForm({
    id: 'site-setting',
    label: 'Site Settings',
    initialValues: initialSiteSettings,
    fields: siteSettingsFields,
    async onSubmit({ id, ...data }) {
      console.log('onSubmit -> id', id);
      await fireDB.collection('settings').doc('site').update(data);
      cms.alerts.success('Saved Settings!');
    }
  });

  useFormScreenPlugin(siteForm);
  return (
    <div className="container">
      <Head>
        <title>Next.js w/ Firebase Client-Side</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">{page.title}</h1>
        <ReactMarkdown className="content-body">{page.body}</ReactMarkdown>
        <JSONPretty data={siteSettings}></JSONPretty>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
        .content-body {
          text-align: left;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

export async function getStaticProps() {
  const page = await fireDB.collection('pages').doc('home').get();
  const siteSettings = await fireDB.collection('settings').doc('site').get();

  return {
    props: {
      siteSettings: {
        id: siteSettings.id,
        ...siteSettings.data()
      },
      page: {
        id: page.id,
        ...page.data()
      }
    }
  };
}
