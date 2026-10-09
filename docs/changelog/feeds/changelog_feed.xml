{%- comment -%} 
  input parameter: "category" (component id)
{%- endcomment -%}

{% comment %} find the last update for the specified category (or take the latest entry) {% endcomment %}
{%- if include.category -%}
  {%- assign id = 'https://docs.signpath.io/changelog/feeds/' | append: include.category | append: '.xml' -%}
  {%- for entry in site.data.changelog -%}
    {%- if entry.updates -%}
      {%- for update in entry.updates -%}
        {%- if update[0] == include.category -%}
          {%- if updated != nil -%}
            {%- assign updated = entry.date -%}
          {%- endif -%}
        {%- endif -%}
      {%- endfor -%}
    {%- endif -%}
  {%- endfor -%}
{%- else -%}
  {%- assign id = 'https://docs.signpath.io/changelog/feeds/all.xml' -%}
  {%- assign updated = site.data.changelog[0].date -%}
{%- endif -%}
<feed xmlns="http://www.w3.org/2005/Atom">
<generator uri="https://jekyllrb.com/" version="3.9.3">Jekyll</generator>
<link href="{{ id }}" rel="self" type="application/atom+xml"/>
<link href="https://docs.signpath.io/" rel="alternate" type="text/html"/>
<updated>{{ updated | date: '%F' }}</updated>
<id>{{ id }}</id>
{%- assign category = include.category -%}
{%- assign selected_component = site.data.changelog_definitions.components | where: "id", category | first -%}
<title type="html">SignPath - {{ selected_component.label }} Changelog</title>
<author>
  <name>SignPath GmbH</name>
  <uri>https://signpath.io</uri>
</author>
{%- for entry in site.data.changelog -%}
  {%- if entry.updates -%}
    {%- for update in entry.updates -%}
      {%- assign componentid = update[0] -%}
			{%- assign component = site.data.changelog_definitions.components | where: "id", componentid | first -%}
      {%- assign release = update[1] -%}
      {% if include.category == nil or include.category == componentid %}
        <entry>
          <id>tag:docs.signpath.io,{{ entry.date | date: '%F'}}:{{ componentid }}:{{ release.version }}</id>
          <title>SignPath {{ component.label }} {{ release.version }}</title>
          <updated>{{ entry.date | date: '%F' }}</updated>
          <published>{{ entry.date | date: '%F' }}</published>
          <link rel="alternate" href="https://docs.signpath.io/changelog#{{ entry.date | date: '%F' }}" />
          <category term="release/{{ componentid }}" label="{{ component.label }}" />
          <summary type="html">New Release: {{ category_label }} {{ release.version }}</summary>
          <content type="html"> <![CDATA[
            <div>
              <h2>New Release: {{ category_label }} {{ release.version }}</h2>
              {%- for changes_per_type in release -%}
                {%- assign change_type = changes_per_type[0] -%}
                {%- assign changes = changes_per_type[1] -%}
                {%- if change_type != "version" -%}
                  {% assign type = site.data.changelog_definitions.change_types | where: "id", change_type | first %}
                  <h3> {{ type.label }}: </h3>
                    <ul>
                      {%- for note in changes -%}
                        <li>
                          {{ note.text | markdownify }}
                          {%- if note.saas_only -%}
                            <span class='enterprise-only'>(SaaS only)</span>
                          {% endif %}
                        </li>
                      {%- endfor -%}
                    </ul>
                {%- endif -%}
              {% endfor %}
            </div> ]]>
          </content>
        </entry>
      {%- endif -%}
    {%- endfor -%}
  {%- endif -%}
{%- endfor -%}
</feed>