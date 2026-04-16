export function changelog() {
	// show more functionality
	var link = document.getElementById('show-older-releases-link');
	if (link) {
		link.addEventListener('click', function(e) {
			var div = document.getElementById('older-releases');
			div.style.display = 'block';
			var p = document.getElementById('show-older-releases');
			p.style.display = 'none';
			e.preventDefault();
			e.stopPropagation();
		});
	}

	// filter functionality
	var select_component = document.getElementById('changelog-component-select');
	if (select_component) {
		select_component.addEventListener('change', function(e) {
			// change url
			const url = new URL(location);
			if (select_component.value == 'all') {
				url.searchParams.delete("component")
			} else {
				url.searchParams.set("component", select_component.value);
			}
			history.pushState({}, "", url);
			
			filter(select_component.value, select_change_type.value);
		});
	}

	var select_change_type = document.getElementById('changelog-change_type-select');
	if (select_change_type) {
		select_change_type.addEventListener('change', function(e) {
			// change url
			const url = new URL(location);
			if (select_change_type.value == 'all') {
				url.searchParams.delete("change_type")
			} else {
				url.searchParams.set("change_type", select_change_type.value);
			}
			history.pushState({}, "", url);
			
			filter(select_component.value, select_change_type.value);
		});
	}

	// parse url to already show hide components on startup
	const url = new URL(location);
	if (url.searchParams.has('component') || url.searchParams.has('change_type')) {
		let component = url.searchParams.get('component') || 'all';
		document.getElementById('changelog-component-select').value = component;

		let change_type = url.searchParams.get('change_type') || 'all';
		document.getElementById('changelog-change_type-select').value = change_type;

		filter(component, change_type)
	}

	function filter(component, change_type) {
		function matchesComponent(node) {
			return component == 'all' || node.classList.contains(`component-${component}`);
		}

		function matchesChangeType(node) {
			return change_type == 'all' || node.classList.contains(`change_type-${change_type}`);
		}

		function showNode(node) {
			node.style.display = 'block';
		}

		function hideNode(node) {
			node.style.display = 'none';
		}

		document.querySelectorAll('section.changelog article.release').forEach(function(releaseDayDiv) {
			// release day contains at least a change in the component and at least a change in the change type, but not necessarily related
			if (matchesComponent(releaseDayDiv) && matchesChangeType(releaseDayDiv) 
				// and all components or all change_types are requested or the exact combination is available
				&& (component == 'all' || change_type == 'all' || releaseDayDiv.querySelectorAll(`div.component-${component}.change_type-${change_type}`).length != 0)) {
				showNode(releaseDayDiv);
				releaseDayDiv.querySelectorAll('div.component').forEach(function(componentDiv) {
					if (matchesComponent(componentDiv) && matchesChangeType(componentDiv)) {
						showNode(componentDiv);
						componentDiv.querySelectorAll('div[class^=change_type-]').forEach(function(changeTypeDiv) {
							if (matchesChangeType(changeTypeDiv)) {
								showNode(changeTypeDiv);
							} else {
								hideNode(changeTypeDiv);
							}
						});
					} else {
						hideNode(componentDiv);
					}
				});
			} else {
				hideNode(releaseDayDiv);
			}
		});

		document.getElementById('changelog-feed').href = `/changelog/feeds/${component}.xml`
	}
}