var API_BASE_URL = 'http://100.31.136.51:3000';

function getBackendStatus() {
	return fetch(API_BASE_URL + '/api/test')
		.then(function (res) {
			if (!res.ok) throw new Error('Server returned ' + res.status);
			return res.json();
		});
}

function bookLawyer(data) {
	return fetch(API_BASE_URL + '/api/book-lawyer', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	}).then(function (res) {
		if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Request failed.'); });
		return res.json();
	});
}
