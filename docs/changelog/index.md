---
header: Product Updates
layout: resources
show_toc: 0
hide_sub_toc: true
description: Product changelog for all SignPath components
datasource: changelog
redirect_from:
  - /product/changelog
---

<section class='changelog'>
<div class='changelog-select-ctn'>
	<div>
		Component 
		<select id='changelog-component-select'>
			<option value='all'>All components</option>
			{%- for component in site.data.changelog_definitions.components -%}
			  <option value='{{ component.id }}'>{{ component.label }}</option>
			{%- endfor -%}
		</select>
	</div>
	<div>
		Changes 
		<select id='changelog-change_type-select'>
			{%- for type in site.data.changelog_definitions.change_types -%}
				<option value='{{ type.id }}'>{{ type.label }}</option>
			{%- endfor -%}
		</select>
	</div>
	<a id='changelog-feed' href='/changelog/feeds/all.xml'>
    Feed {% include rss.svg %}
  </a>
</div>

{% assign today = site.time | date: '%s' %}
{% assign one_year_ago = today | minus: 31536000 %}
{% assign opened_old_container = false %}

{% for entry in site.data.changelog %}

	{% comment %} convert to unix timestamp {% endcomment %}
	{% assign timestamp = entry.date | date: '%s' | to_i %}
	{% assign timestamp_num = timestamp | minus: 1 %}

	{% comment %} put old changelogs into an own div wrapper {% endcomment %}
	{% if timestamp_num < one_year_ago %}
		{% if opened_old_container == false %}
			{% assign opened_old_container = true %}
			<p id='show-older-releases'><a id='show-older-releases-link' href='#'>Show older releases</a></p>
			<div id='older-releases'> 	
		{% endif %}
	{% endif %}

	{% comment %} calculate css class list for the entry {% endcomment %}
	{% assign class_list = 'release' %}
	{% for update in entry.updates %}
		{% comment %} extract the component id (e.g. application) {% endcomment %}
		{% assign componentid = update[0] %}
		{% assign class_list = class_list | append: ' component-' | append: componentid %}
		{% assign release = update[1] %}
		{% for changes_per_type in release %}
			{% assign change_type = changes_per_type[0] %}
			{% assign class_list = class_list | append: ' change_type-' | append: change_type %}
		{% endfor %}
	{% endfor %}
	{% assign class_list = class_list | split: " " | uniq | join: " " %}

	{% comment %} actual changelog rendering {% endcomment %}
	<article class='{{ class_list }}' id="{{ entry.date | date: '%Y-%m-%d' }}">
		<h1>&nbsp;<span>{{ entry.date | date: '%B %d, %Y'}}</span></h1>
		{% if entry.updates %}
			{% for update in entry.updates %}
				
				{% comment %} extract component id (e.g. application, crypto_providers, etc.) and release {% endcomment %}
				{% assign componentid = update[0] %}
				{% assign release = update[1] %}
				{% assign major_version = release.version | split: '.' | first | times: 1 %}
				
				{% assign component_change_type_class_list = 'component' %}
				{% for changes_per_type in release %}
					{% assign change_type = changes_per_type[0] %}
					{% assign component_change_type_class_list = component_change_type_class_list | append: ' change_type-' | append: change_type %}
				{% endfor %}

				<div class='component-{{ componentid }} {{ component_change_type_class_list }}'>
					{% assign component = site.data.changelog_definitions.components | where: "id", componentid | first %}
					<h2>{{ component.label }} {{ release.version }}</h2>
					
					{% for changes_per_type in release %}
						{% comment %} extract change_type (e.g. new_features) and actual change log {% endcomment %} 
						{% assign change_type = changes_per_type[0] %}
						{% assign changes = changes_per_type[1] %}
						
						{% comment %} necessary for current yaml structure {% endcomment %}
						{% if change_type != "version" %}
							<div class='change_type-{{ change_type }}'>
								{%- assign type = site.data.changelog_definitions.change_types | where: "id", change_type | first -%}
								<h3> {{ type.label }}: </h3>
								<ul>
									{% for note in changes %}
										<li>
											{{ note.text | markdownify }}
											{% if note.saas_only %}
												<span class='enterprise-only'>(SaaS only)</span>
											{% endif %}
										</li>
									{% endfor %}
								</ul>
							</div> <!-- change_type -->
						{% endif %}
					{% endfor %}
					{% assign include_cryptoproviders_download_panel = false %}
					{%- if componentid == 'macos_cryptotokenkit' and major_version >= 2 -%}
						{% assign include_cryptoproviders_download_panel = true %}
					{%- endif -%}
					{%- if componentid == 'crypto_providers' and major_version >= 6 -%}
					  {% assign include_cryptoproviders_download_panel = true %}
					{%- endif -%}
					{%- if include_cryptoproviders_download_panel -%}
						{% if componentid == 'crypto_providers' %}
						  {% assign crypto_provider_components = "cryptoki,windows_ksp" %}
						{% else %}
						  {% assign crypto_provider_components = "macos_cryptotokenkit" %}
						{% endif %}
						{% include download-cryptoproviders-panel.md version=release.version components=crypto_provider_components %}
					{%- endif -%}
				</div> <!-- component -->
			{% endfor %}
		{% else %}
			<p class='no-updates'>No customer facing changes in this release.</p>
		{% endif %}
	</article>
{% endfor %}

{% if opened_old_container == true %}
</div> <!-- older-releases -->
{% endif %}

</section>