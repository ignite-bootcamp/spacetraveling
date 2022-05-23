import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);

  async function handleLoadMore(): Promise<void> {
    const raw = await fetch(postsPagination.next_page);
    const response = await raw.json();

    setPosts([...posts, ...response.results]);
  }

  return (
    <main className={styles.mainContent}>
      <div className={commonStyles.container}>
        <Header />
        <section>
          <ul>
            {posts.map(post => (
              <li key={post.uid}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <div>
                      <time>
                        <FiCalendar size={15} />
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          { locale: ptBR }
                        )}
                      </time>
                      <p>
                        <FiUser size={15} />
                        {post.data.author}
                      </p>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {postsPagination.next_page && (
          <footer>
            <button onClick={handleLoadMore} type="button">
              Carregar mais posts
            </button>
          </footer>
        )}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');
  return {
    props: {
      postsPagination: {
        results: postsResponse.results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
