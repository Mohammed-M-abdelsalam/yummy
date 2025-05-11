// fetching data from API
function fetchData(url){
    $('.loader').removeClass('d-none');
    return fetch(url)
    .then(response =>{
        if(!response.ok){
            throw new Error('Network response was not ok' + response.statusText);
        }
        $('.loader').addClass('d-none');
        return response.json();
    })
    .catch(error => console.error('Error fetching data:', error));
}

// debouncing function
function debounce(func, delay){
    let timeout;
    return function(...args){
        if(timeout){
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// navigation menu
function toggleNav(){
    $('.menu-btn').click(function() {
        $('.nav-list').toggleClass('active-nav-list');
        $('.nav-list li').slideToggle(500);
        $('#menu-icon').toggleClass('fa-xmark fa-bars fa-2xl');
    })
}
function closeNav(){
    $('.nav-list').removeClass('active-nav-list');
    $('.nav-list li').slideToggle(500);
    $('#menu-icon').removeClass('fa-xmark').addClass('fa-bars fa-2xl');
}

// popup
function closePopup(root, details){
        root.classList.remove('d-none');
        details.classList.add('d-none');
}

// card creation
function createCard(data){
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.innerHTML = `
    <div style="min-height: 200px;" class="card-id" data-id='${data.idMeal}'>
        <div class="card position-relative overflow-hidden rounded-3">
            <img class="w-100" src="${data.strMealThumb}" alt="${data.strMeal}">
            <p class="fs-1">${data.strMeal}</p>
        </div>
    </div>
    `;
    return card;
}

// home page
function getHomeData(){
    const root = document.querySelector('#root');
    root.innerHTML = ''
    fetchData('https://www.themealdb.com/api/json/v1/1/search.php?f=b')
    .then(data => {
        const meals = data.meals;
        meals.forEach(meal => {
            root.appendChild(createCard(meal));
        });
        $('#root').click(function(e) {
            if (e.target.closest('.card-id')) {
                const mealId = e.target.closest('.card-id').dataset.id;
                getMealDetails(mealId);
            }
        });
    });
}

// meal details
function getMealDetails(id){
    scrollTo(0, 0);
    const root = document.querySelector('#root');
    const details = document.querySelector('#details-popup');
    root.classList.add('d-none');
    details.classList.remove('d-none');
    fetchData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(data => {
        const meal = data.meals[0];
        details.innerHTML = `
        <div class="meal-details row row-cols-1 row-cols-md-2 justify-content-center mx-auto g-3 w-75 my-3">
            <div>
                <button onclick="" class="btn-close bg-white position-absolute top-0 end-0 m-3"></button>
                <div class="overflow-hidden rounded-3">
                    <img class="w-100" src="${meal.strMealThumb}" alt="${meal.strMeal}">
                </div>
                <h2>${meal.strMeal}</h2>
            </div>
            <div>
                <p>${meal.strInstructions}</p>
                <p class="fw-bold fs-3">Area: <span class="fw-normal">${meal.strArea}</span></p>
                <p class="fw-bold fs-3">Category: <span class="fw-normal">${meal.strCategory}</span></p>
                <p class="fw-bold fs-3">Tags: </p>
                <div class="mb-4">
                    <a class="text-decoration-none text-black bg-primary-subtle p-1 rounded" href="${meal.strSource}" target="_blank">Source</a>
                    <a class="text-decoration-none text-black bg-danger-subtle p-1 rounded" href="${meal.strYoutube}" target="_blank">Youtube</a>
                </div>
                <div>
                    <p class="fw-bold fs-3">Ingredients:</p>
                    <ul class="list-unstyled d-flex gap-3 flex-wrap text-black">
                        ${Object.keys(meal).filter(key => key.startsWith('strIngredient') && meal[key]).map(key => `<li class="p-2 rounded" style="background: #cff4fc;">${meal[key]}: ${meal[`strMeasure${key.slice(13)}`]}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>`;
        $('.btn-close').click(function() {
            closePopup(root, details);
        });
    });
}

// category
function getMealsByCategory(categoryName){
    const root = document.querySelector('#root');
    fetchData(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`)
    .then(data => {
        root.innerHTML = '';
        const meals = data.meals;
        meals.forEach(meal => {
            console.log(meal);
            root.appendChild(createCard(meal));
        });
    });
    
}

function getCategories(){
    const root = document.querySelector('#root');
    root.innerHTML = '<h1 class="fw-bold text-white">Categories</h1>';
    fetchData('https://www.themealdb.com/api/json/v1/1/categories.php')
    .then(data => {
        const categories = data.categories;
        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'meal-card';
            card.innerHTML += `
            <div class="category-name" data-name='${category.strCategory}'>
                <div class="card position-relative overflow-hidden rounded-3">
                    <img class="w-100" src="${category.strCategoryThumb}" alt="${category.strCategory}">
                    <p class="fs-1">${category.strCategory}</p>
                </div>
            </div>
            `;
            root.appendChild(card);
            $('#root').click(function(e) {
                if (e.target.closest('.category-name')) {
                    const categoryName = e.target.closest('.category-name').dataset.name;
                    getMealsByCategory(categoryName);
                }
            });
        });
    });
}


// search page
function getSearchPage(){
    const root = document.querySelector('#root');
    root.innerHTML = '';
    root.innerHTML = `
        <div class="search-page w-100">
            <input class="form-control rounded border-0 text-center mb-4" type="text" id="search-input" placeholder="Search for a meal...">
            <div id="search-results" class="row row-cols-md-3 g-3 w-75 mx-auto justify-content-center text-center"></div>
        </div>`;
        getMealsBySearch();
    }
function getMealsBySearch(){
    const searchResults = document.querySelector('#search-results');
    document.querySelector('#search-input').addEventListener('input', debounce(function(e){
        searchResults.innerHTML = '';
        const searchValue = e.target.value;
        fetchData(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchValue}`)
        .then(data => {
            const meals = data.meals;
            if(meals){
                meals.forEach(meal => {
                    console.log(meal);
                    searchResults.appendChild(createCard(meal));
                });
            }else{
                searchResults.innerHTML = `<h1 class="text-center text-danger">No results found</h1>`;
            }
        });
    }, 500));
}

// area
function getMealsByArea(areaName){
    scrollTo(0, 0);
    const root = document.querySelector('#root');
    fetchData(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${areaName}`)
    .then(data => {
        root.innerHTML = '';
        const meals = data.meals;
        meals.forEach(meal => {
            console.log(meal);
            root.appendChild(createCard(meal));
        });
    });
}

function getAreaPage(){
    const root = document.querySelector('#root');
    root.innerHTML = '<h1 class="fw-bold text-white">Area</h1>';
    fetchData('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
    .then(data => {
        const areas = data.meals;
        areas.forEach(area => {
            const card = document.createElement('div');
            card.className = 'meal-card';
            card.innerHTML += `
            <div id="area-name"  data-name='${area.strArea}'>
                <div>
                    <p class="fs-1 fw-bold text-center p-2 bg-white text-black rounded" style="cursor: pointer;">${area.strArea}</p>
                </div>
            </div>
            `;
            root.appendChild(card);
        });
        $('#root').click(function(e) {
            if (e.target.closest('#area-name')) {
                const areaName = e.target.closest('#area-name').dataset.name;
                getMealsByArea(areaName);
            }
        });
    });
}

// ingredients page
function getMealsByIngredient(ingredientName){
    scrollTo(0, 0);
    const root = document.querySelector('#root');
    fetchData(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientName}`)

    .then(data => {
        root.innerHTML = '';
        const meals = data.meals;
        meals.forEach(meal => {
            console.log(meal);
            root.appendChild(createCard(meal));
        });
    });
}
function getIngredientsPage(){
    const root = document.querySelector('#root');
    root.innerHTML = '<h1 class="fw-bold text-white">Ingredients</h1>';
    fetchData('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
    .then(data => {
        const ingredients = data.meals;
        ingredients.forEach(ingredient => {
            const card = document.createElement('div');
            card.className = 'meal-card';
            card.innerHTML += `
            <div id="ingredient-name" class="h-100" data-name='${ingredient.strIngredient}'>
                <div class="d-flex flex-column justify-content-center p-3 h-100 text-center p-2 bg-white text-black rounded" style="cursor: pointer;">
                    <h3 class="fs-1 fw-bold">${ingredient.strIngredient}</h3>
                    <p>${ingredient.strDescription?.slice(0, 100)? ingredient.strDescription.slice(0, 100)+'...' : ''}</p>
                </div>
            </div>
            `;
            root.appendChild(card);
        });
        $('#root').click(function(e) {
            if (e.target.closest('#ingredient-name')) {
                const ingredientName = e.target.closest('#ingredient-name').dataset.name;
                getMealsByIngredient(ingredientName);
            }
        });
    });
}

// contact page
function getContactPage(){
    const root = document.querySelector('#root');
    const contactSection = document.querySelector('#contact-section');
    root.innerHTML = '';
    contactSection.classList.remove('d-none');
    contactSection.innerHTML = `
    <div class="error-message d-none bg-danger-subtle text-danger-emphasis text-center py-3 rounded"></div>
    <div style="width: 400px; margin-inline: auto;">
        <h1 class="fw-bold text-white my-5">Contact</h1>
        <form id="contact-form" class="contact-page">
            <input class="form-control rounded border-0 mb-4" name="name-input" type="text" id="name-input" placeholder="Name">
            <input class="form-control rounded border-0 mb-4" name="email-input" type="email" id="email-input" placeholder="Email">
            <input class="form-control rounded border-0 mb-4" name="phone-input" type="tel" id="phone-input" placeholder="Phone">
            <input class="form-control rounded border-0 mb-4" name="age-input" type="number" id="age-input" placeholder="Age">
            <input class="form-control rounded border-0 mb-4" name="password-input" type="password" id="password-input" placeholder="Password">
            <input class="form-control rounded border-0 mb-4" name="password-confirm-input" type="password" id="password-confirm-input" placeholder="Repeat Password">
            <button type="submit" class="btn btn-primary">Send</button>
        </form>
    </div>
    `;
}
function closeContactSection(){
    const contactSection = document.querySelector('#contact-section');
    contactSection.classList.add('d-none');
}

// form validation
function validateForm(form){
    const errorMessage = document.querySelector('.error-message');
    const formData = new FormData(form);
    const nameInput = formData.get('name-input');
    const emailInput = formData.get('email-input');
    const phoneInput = formData.get('phone-input');
    const ageInput = formData.get('age-input');
    const passwordInput = formData.get('password-input');
    const passwordConfirmInput = formData.get('password-confirm-input');
    const validationObj = {
        nameInput: /^[A-Za-z0-9\s]{3,}$/,
        emailInput: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneInput: /^\+?\d{10,15}$/,
        ageInput: /^\d{1,2}$/,
        passwordInput: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 
    }
    const isValid = {
        nameInput: validationObj.nameInput.test(nameInput),
        emailInput: validationObj.emailInput.test(emailInput),
        phoneInput: validationObj.phoneInput.test(phoneInput),
        ageInput: validationObj.ageInput.test(ageInput),
        passwordInput: validationObj.passwordInput.test(passwordInput),
    }
    if(!isValid.nameInput){
        errorMessage.classList.remove('d-none');
        errorMessage.innerHTML = 'Special characters not allowed and minimum 3 characters';
        return false;
    }else if(!isValid.emailInput){
        errorMessage.classList.remove('d-none');
        errorMessage.innerHTML = 'Email not valid *exemple@yyy.zzz';
        return false;
    }else if(!isValid.phoneInput){
        errorMessage.classList.remove('d-none');
        errorMessage.innerHTML = 'Enter valid Phone Number';
        return false;
    }else if(!isValid.ageInput){
        errorMessage.classList.remove('d-none');
        errorMessage.innerHTML = 'Enter valid age';
        return false;
    }else if(!isValid.passwordInput){
        errorMessage.classList.remove('d-none');
        errorMessage.innerHTML = 'IEnter valid password *Minimum eight characters, at least one letter and one number:*';
        return false;
    }else if(passwordInput !== passwordConfirmInput){
        errorMessage.classList.remove('d-none');
        errorMessage.innerHTML = 'Passwords do not match.'; 
        return false;
    }else{
        errorMessage.classList.add('d-none');
        return true;
    }
}
function handleFormSubmit(){
    const form = document.querySelector('#contact-form');
    form.addEventListener('submit', function(e){
        e.preventDefault();
        const isValid = validateForm(e.target);
        if(isValid){
            e.target.reset();
            const errorMessage = document.querySelector('.error-message');
        }
    });
}

getHomeData();
toggleNav();

$('.nav-list li').click(function() {
    closeNav();
    closePopup(document.querySelector('#root'), document.querySelector('#details-popup'));
    const navId = $(this).attr('id');
    if(navId === 'home') {
        getHomeData();
        closeContactSection();
    }else if (navId === 'categories') {
        getCategories();
        closeContactSection();
    }else if(navId === 'area') {
        getAreaPage();
        closeContactSection();
    }else if(navId === 'search') {
        getSearchPage();
        closeContactSection();
    }else if(navId === 'ingredients') {
        getIngredientsPage();
        closeContactSection();
    }else if(navId === 'contact') {
        getContactPage();
        handleFormSubmit();
    }
});
