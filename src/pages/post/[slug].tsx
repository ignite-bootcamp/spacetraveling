/* eslint-disable no-param-reassign */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { MdOutlineWatchLater } from 'react-icons/md';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  const timeReading = post.data.content.reduce((acc, item) => {
    const words =
      RichText.asText(item.body).split(' ').length +
      item.heading.split(' ').length;

    acc += words / 200;
    return Math.ceil(acc);
  }, 0);

  // post.data.content[0].body[0].text.split(' ').length / 200

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <div className={commonStyles.largerContainer}>
        <Header />
      </div>
      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={post.data.title}
      />

      <main className={styles.mainContent}>
        <div className={commonStyles.largerContainer}>
          <h1>{post.data.title}</h1>
          <div className={styles.stats}>
            <time>
              <FiCalendar size={15} />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>
              <FiUser size={15} />
              <span>{post.data.author}</span>
            </p>
            <div>
              <MdOutlineWatchLater size={15} />
              <span>{timeReading} min</span>
            </div>
          </div>

          <div className={styles.content}>
            {post.data.content.map(content => (
              <>
                <div key={content.heading}>
                  <h2>{content.heading}</h2>
                </div>
                <div>
                  {content.body.map(body => (
                    <p key={body.text}>{body.text}</p>
                  ))}
                </div>
              </>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  return {
    paths: posts.results.map(item => ({
      params: { slug: item.uid },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', params.slug as string);
  return {
    props: {
      post: response,
    },
  };
};
