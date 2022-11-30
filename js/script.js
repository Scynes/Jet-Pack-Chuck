const chuckAPIURL = 'https://api.chucknorris.io/jokes/random';

$.ajax({'url': chuckAPIURL}).then(
    (data) => {
        console.log(data.value);
    },
    (error) => {

    }
)