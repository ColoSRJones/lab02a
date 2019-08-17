'user strict'

Image.all = [];

function Image(image) {
  this.imageUrl = image.image_url;
  this.title = image.title;
  this.description = image.description;
  this.keyword = image.keyword;
  this.horns = image.horns;
  Image.all.push(this);
}

// populate the images on page load
$.when(
  $.get(
    './data/page-1.json',
    (data) => {
      data.forEach((image) => {
        new Image(image);
      });
    },
    'json'
  ),

  $.get(
    './data/page-2.json',
    (data) => {
      data.forEach((image) => {
        new Image(image);
      });
    },
    'json'
  )
).then(() => {
  const pagNav = $('#image-pages');
  const page = document.createElement('a');
  $(page).addClass('page-link');
  for (let i = 0; i < Math.ceil(Image.all.length / 10); i++) {
    $(page).text((i+1));
    $(page).attr('href', `#${$(page).text()}`);
    $(page).attr('data-images', `[${i * 10}, ${i * 10 + 10}]`);
    $(pagNav).append(page.cloneNode(true));
  }
}).then(() => $('.page-link').click(paginate));

const generateImage = (image) => {
  const imageContainer = document.createElement('section');
  const imageTitle = document.createElement('h2');
  const imageImg = document.createElement('img');
  const imageDescription = document.createElement('p');

  $(imageContainer).addClass('image');
  $(imageContainer).attr({
    'data-keyword': image.keyword,
    'data-horns': image.horns
  });
  $(imageTitle).text(image.title);
  $(imageImg).attr({
    src: image.imageUrl,
    alt: image.title
  });
  $(imageDescription).text(image.description);


  // get template data from html
  const template = $('#image-template').html();

  // compile template data into a function
  const templateScript = Handlebars.compile(template);

  const imageData = {
    data_keyword: image.keyword,
    title: image.title,
    image_url: image.imageUrl,
    description: image.description,
    horns: image.horns
  };

  let html = templateScript(imageData);
  $('main').append(html);
};


$('img').click((e) => console.log(e.target));

$(document).ready(() => {
  const filter = $('#filter');
  const filterOption = document.createElement('option');
  const options = [];
  Image.all.forEach(image => !options.includes(image.keyword) ? options.push(image.keyword) : '');
  options.forEach(option => $(filterOption).clone().attr('value', option).text(option).appendTo('#filter optgroup:first'));

  const filterImages = (selectedOption) => {
    Object.values($('.image')).forEach(image => {
      if (selectedOption === 'default') {
        $(image).show();
      } else if ($(image).attr('data-keyword') !== $('#filter option:selected').text()) {
        $(image).hide();
      } else {
        $(image).show();
      }
    });
  };

  const sortImages = (filterValue) => {
    if (filterValue === 'a-to-z') {
      Image.all.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filterValue === 'z-to-a') {
      Image.all.sort((a, b) => b.title.localeCompare(a.title));
    } else if (filterValue === 'high-to-low') {
      Image.all.sort((a, b) => b.horns - a.horns);
    } else if (filterValue === 'low-to-high') {
      Image.all.sort((a, b) => a.horns - b.horns);
    }
  };

  sortImages('a-to-z');
  Image.all.slice(0, 10).forEach(image => generateImage(image));

  filter.change(() => {
    let selectedOption = filter.val();
    if (filter[0].selectedIndex < $('#filter option').length - 4) {
      filterImages(selectedOption);
    } else {
      $('main').html('');
      sortImages(filter.val());
      Image.all.slice(...JSON.parse($(`[href='${window.location.hash}']`).attr('data-images'))).forEach(image => generateImage(image));
    }
  });
});

const paginate = e => {
  const imgsToShow = JSON.parse($(e.target).attr('data-images'));
  $('main').html('');
  Image.all.slice(...imgsToShow).forEach(img => {
    generateImage(img);
  });
};



