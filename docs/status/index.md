---
title: Status
header: Status
description: SignPath SaaS environment operational status
datasource: status
layout: status
---

<section class="status-section">
	<div>
		<h2 class='{{ site.data.status.current.type }}'>
			{%- if site.data.status.current.type == "critical" -%}
				{%- include status_critical.svg -%}
			{%- elsif site.data.status.current.type == "warning" -%}
				{%- include status_warning.svg -%}
			{%- elsif site.data.status.current.type == "good" -%}
				{%- include status_good.svg -%}
			{%- else -%}
				[unknown status type]
			{%- endif -%}
			{{ site.data.status.current.title }}
		</h2>			
		<div markdown="1">
{{ site.data.status.current.description }}
			{%- if site.data.status.current.link -%} <a href="{{ site.data.status.current.link }}"> (Read more)</a> {%- endif -%}
		</div>	
		<div class="rss-header">
			<h3 id='status-planned'>Planned maintenance</h3> 
			<a id='status-planned-feed' href='/status/feeds/planned.xml'>
				Feed {% include rss.svg %}
			</a>
		</div>
		{%- unless site.data.status.planned -%}
			<div>No maintenance planned.</div>
		{%- endunless -%}
		<ul>
			{%- for incident in site.data.status.planned -%}
				<li class="{{ incident.type }}">
					<h3 id="{{ incident.range | slugify }}">{{ incident.date}}</h3>
					<label>{{ incident.range }} ({{ incident.type | capitalize }})</label>
					<h4>{{ incident.title }}</h4>
					<div markdown="1">
					
{{ incident.description }}
{% if incident.link %} <a href="{{ incident.link }}"> (Read more)</a> {% endif %}
</div>
				</li>
			{%- endfor -%}
		</ul>
		<div class="rss-header">
			<h3 id='status-past-'>Past incidents and maintenance</h3> 
			<a id='status-past-feed' href='/status/feeds/incidents.xml'>
				Feed {% include rss.svg %}
			</a>
		</div>
		<ul>
			{%- for incident in site.data.status.incidents -%}
				<li class="{{ incident.type }}">
					<h3 id="{{ incident.range | slugify }}">{{ incident.date}}</h3>
					<label>{{ incident.range }} ({{ incident.type | capitalize }})</label>
					<h4>{{ incident.title }}</h4>
					<div markdown="1">

{{ incident.description }}
{% if incident.link %} <a href="{{ incident.link }}"> (Read more)</a> {% endif %}
</div>
				</li>
			{%- endfor -%}
		</ul>
		<div class="rss-header">
			<h3 id="software-updates">Regular software updates</h3> 
		</div>
		<p>
			Note that system updates and SignPath software updates are not listed here unless they may result in more than 5 minutes of downtime.
			We recommend that you set a retry limit for <i>unavailable service</i> errors of 10 minutes.
			This is also the default for our client components and connectors.
		</p>
	</div>
</section>

