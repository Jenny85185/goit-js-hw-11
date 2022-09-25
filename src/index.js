import './sass/index.scss';
import { lightbox } from './js/slider';
import Notiflix from 'notiflix';
import Photo from './js/fetchPhoto.js';
import rendCard from './js/rendCard.js';

const refs = {
  searchForm: document.querySelector('#search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let isShown = 0;
const photo = new Photo();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(e) {
  e.preventDefault();
  isShown = 0;
  refs.galleryContainer.innerHTML = '';
  photo.resetPage();
  photo.query = e.target.elements.searchQuery.value.trim();
  

  if (photo.query === '') {
     Notiflix.Notify.warning('Please, fill the main field');
    return;
  }

  photo.fetchGalleryCards().then(data => {
    refs.galleryContainer.innerHTML = '';
    refs.loadMoreBtn.classList.remove('is-hidden');

    if (!data.hits.length) {
       Notiflix.Notify.warning(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      refs.loadMoreBtn.classList.add('is-hidden');
      return;
    }
    onRenderGallery(data);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images !!!`);
    refs.loadMoreBtn.classList.remove('is-hidden');
    lightbox.refresh();
  });

  // const options = {
  //   rootMargin: '50px',
  //   root: null,
  //   threshold: 0.3,
  // };

  // const observer = new IntersectionObserver(onLoadMore, options);
  // observer.observe(refs.loadMoreBtn);
}

async function onLoadMore() {
  photo.fetchGalleryCards().then(onScrollmake);
}

function onRenderGallery(data) {
  const markup = data.hits.map(data => rendCard(data)).join('');
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
}

function onScrollmake(data) {
  onRenderGallery(data);

  lightbox.refresh();

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 0,
    behavior: 'smooth',
  });

  if (data.hits.length < 40 && data.hits.length > 0) {
    refs.loadMoreBtn.classList.add('is-hidden');
    photo.incrementPage();
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  }
}
