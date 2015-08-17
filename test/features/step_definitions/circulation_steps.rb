# encoding: UTF-8
require_relative '../support/services/svc/preference.rb'
require_relative '../support/services/svc/user.rb'
require 'pp'

Given(/^at en bok er utlånt til en låner$/) do
  step "jeg registrerer \"Knut\" som aktiv låner"
  step "jeg registrerer utlån av boka"
end

Given(/^at låneren har materiale han ønsker å (levere|låne)$/) do |action|
  step "jeg legger inn boka som en ny bok"
  step "at boka er tilgjengelig"
end

Given(/^at materialet ikke er lånt ut til låner$/) do
  step "at boka finnes i biblioteket"
end

Given(/^at det finnes materiale som er utlånt til låneren$/) do
  step "at boka finnes i biblioteket"
  step "materiale med strekkode \"#{@active[:item].barcode}\" lånes ut til \"#{@active[:patron].cardnumber}\""
end

Given(/^at materialet er til utlån$/) do
  step "viser systemet at boka er en bok som kan lånes ut"
end

Given(/^at det ikke finnes en reservasjon på materialet$/) do
  step "viser systemet at boka ikke er reservert"
end

Given(/^at materialet ikke er til utlån$/) do
  step "det finnes en autorisert verdi for \"NOT_LOAN\""
  step "kan jeg finne den autoriserte verdien i listen over autoriserte verdier"
  step "jeg leter opp boka i katalogiseringssøk"
  step "velger å redigere eksemplaret"

  # Not for loan is $952_7
  s = @browser.select_list(:id => /^tag_952_subfield_7_[0-9]+$/)
  s.select_value @context[:authorised_value]
  @browser.button(:value => "Save changes").click
  step "systemet viser at eksemplaret ikke er til utlån"
end

Given(/^at låneren har funnet en bok$/) do
  @site.Opac.biblio_detail(@context[:books][0].biblionumber)
end

Then(/^systemet viser at eksemplaret ikke er til utlån$/) do
  book = @active[:book]
  item = @active[:item] ||= book.items.first

  biblio_page = @site.AddItem.visit(book.biblionumber)
  not_for_loan_text = biblio_page.not_for_loan_text(item.barcode)
  not_for_loan_text.should eq(@context[:authorised_value_description])
end

Then(/^systemet viser at materialet( ikke)? er utlånt$/) do |bool|
  book = @active[:book]
  item = @active[:item] ||= book.items.first

  biblio_detail = @site.BiblioDetail.visit(book.biblionumber)
  biblio_detail.header.should include(book.title)

  if bool
    biblio_detail.item_status(item.barcode).should_not include("Checked out")
  else
    biblio_detail.item_status(item.barcode).should include("Checked out")
  end
end

Given(/^at materialet har en eieravdeling$/) do
  @active[:item].branch.should_not == nil
end

When(/^materiale med strekkode "(.*?)" lånes ut til "(.*?)"$/) do |barcode, patron|
  step "jeg registrerer \"#{patron}\" som aktiv låner"
  step "jeg registrerer utlån med strekkode \"#{barcode}\""
end

When(/^jeg registrerer "(.*?)" som aktiv låner$/) do |patron|
  @site.Home.visit.find_patron_for_checkout("#{patron} #{@active[:patron].surname}")
end

When(/^jeg registrerer utlån av boka$/) do
  book = @active[:book]
  step "jeg registrerer utlån med strekkode \"#{book.items.first.barcode}\""
end

When(/^jeg registrerer utlån med strekkode "(.*?)"$/) do |barcode|
  book = @context[:books].find {|b| b.items.find {|i| i.barcode == "#{barcode}" } }
  item = book[:items].find {|i| i.barcode == "#{barcode}" }

  @site.Checkout.checkout(barcode)

  @active[:book] = book
  @active[:item] = item
  @cleanup.push( "utlån #{barcode}" =>
    lambda do
      @site.Home.visit.select_branch().checkin(book.items.first.barcode)
    end
  )
end

When(/^boka blir registrert innlevert$/) do
  @site.Home.visit.select_branch().checkin(@active[:book].items.first.barcode)
end

When(/^låneren reserverer boka$/) do
  @browser.link(:class => "reserve").click
  @browser.element(:class => "placehold").click
end

Then(/^viser systemet at boka er reservert av låneren$/) do
  @browser.url.should eq("#{opac}/cgi-bin/koha/opac-user.pl#opac-user-holds")
  @browser.link(:href => "/cgi-bin/koha/opac-detail.pl?biblionumber=#{@context[:books][0].biblionumber}").present?.should be true
end

Given(/^at materialet ikke er holdt av til en annen låner$/) do
  step "viser systemet at boka ikke er reservert"
end

Given(/^at det finnes en reservasjon på materialet$/) do
  step "at materialet er reservert av en annen låner"
end

Gitt(/^at det finnes en reservasjon på en annen avdeling$/) do
  step "at materialet er reservert av en annen låner"
end

Given(/^at materialet er reservert av en annen låner$/) do
  step "at det finnes en låner med lånekort", table(%{
    | firstname | password |
    | Ove       | 1234     |
  })
  step "boka er reservert av \"#{@active[:patron].surname}\""
end

Given(/^at det finnes en låner med passord$/) do
  step "at det finnes en låner med lånekort", table(%{
    | firstname | password |
    | Petter    | 6666     |
  })
end

When(/^boka er reservert av "(.*?)"$/) do |name|
  step "at det er aktivert en standard sirkulasjonsregel"
  step "boka reserveres av \"#{name}\" på egen avdeling"
  step "reserveringskøen kjøres"
  step "viser systemet at boka er reservert"
  step "vises boka i listen over bøker som skal plukkes"
end

Given(/^at materialet er holdt av til en annen låner$/) do
  step "at materialet er reservert av en annen låner"
  step "boka plukkes og skannes inn"
end

When(/^boka reserveres av "(.*?)" på egen avdeling$/) do |name|
  book = @active[:book]
  @browser.goto intranet(:reserve)+book.biblionumber

  user = SVC::User.new(@browser).get(name).first

  # lookup patron via holds
  form = @browser.form(:id => "holds_patronsearch")
  form.text_field(:id => "patron").set user["dt_cardnumber"]
  form.submit

  # place reservation on branch
  form = @browser.form(:id => "hold-request-form")
  form.select_list(:name => "pickup").select_value @active[:branch].code
  # TODO: place hold on specific item?
  # form.radio(:value => book.items.first.itemnumber).set
  form.submit
end

When(/^reserveringskøen kjøres$/) do
  `ssh 192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-foreach --enabled /usr/share/koha/bin/cronjobs/holds/build_holds_queue.pl' >&2`
  STDERR.puts "build_holds_queue.pl has returned"
end

When(/^katalogen reindekseres$/) do
  `ssh 192.168.50.12 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no 'sudo docker exec koha_container sudo koha-rebuild-zebra -v -b -f --wait-for-lock #{PILLAR['koha']['instance']}' >&2`
  STDERR.puts "koha-rebuild-zebra has returned"
end

When(/^boka plukkes og skannes inn$/) do
  step "boka sjekkes inn på låners henteavdeling"
  step "viser systemet at boka er reservert og skal holdes av"
  step "det bekreftes at boka skal holdes av"
  step "viser systemet at boka ligger til avhenting"
end

Then(/^viser systemet at boka( ikke)? er reservert$/) do |notreserved|
  @browser.goto intranet(:pendingreserves)
  if notreserved
    if @browser.table(:id => "holdst").exists?
      @browser.table(:id => "holdst").text.should_not include(@active[:book].title)
    end
  else
   @browser.table(:id => "holdst").text.should include(@active[:book].title)
  end
end

Then(/^viser systemet at boka er reservert og skal holdes av$/) do
  @browser.div(:id => "hold-found2").text.should include(@active[:book].title)
end

When(/^boka sjekkes inn på låners henteavdeling$/) do
  @site.SelectBranch.visit.select_branch(@active[:patron].branch.code)
  @site.IntraPage.checkin(@active[:book].items.first.barcode)
end

When(/^det bekreftes at boka skal holdes av$/) do
  @browser.form(:class => "confirm").input(:class => "approve").click
end

Then(/^viser systemet at boka ligger til avhenting$/) do
  @browser.goto intranet(:waitingreserves)
  book = @active[:book]
  table = @browser.div(:id => "holdswaiting").table(:id => "holdst")
  table.text.should include(@active[:book].title)
end

Then(/^systemet viser at materialet fortsatt er holdt av til den andre låneren$/) do
  step "viser systemet at boka ligger til avhenting"
end

Then(/^vises boka i listen over bøker som skal plukkes$/) do
  @browser.goto intranet(:holdsqueue)
  @browser.form(:name => "f").submit
  @browser.table(:id => "holdst").wait_until_present
  @browser.table(:id => "holdst").tbody.text.should include(@active[:book].title)
  @browser.table(:id => "holdst").tbody.text.should include(@active[:patron].cardnumber)
end

Given(/^at det er aktivert en standard sirkulasjonsregel$/) do
  steps %Q{
    Og at det finnes følgende sirkulasjonsregler
      | categorycode | itemtype | maxissueqty | issuelength | reservesallowed | onshelfholds |
      | *            | *        | 10          | 10          | 10              | 1            |
    }
end


Given(/^at låneren har et antall lån som( ikke)? er under maksgrense for antall lån$/) do |maxloans|
  item   = @active[:item] ||= @active[:book].items.first
  patron = @active[:patron]
  if maxloans
    step "at det finnes følgende sirkulasjonsregler", table(%{
      | categorycode | itemtype | maxissueqty | issuelength | reservesallowed | onshelfholds |
      | *            | *        | 1           | 1           | 1               | 1            |
      })
  else
    step "at det er aktivert en standard sirkulasjonsregel"
  end
  step "materiale med strekkode \"#{item.barcode}\" lånes ut til \"#{patron.cardnumber}\""
  step "jeg legger til et nytt eksemplar"
end

Given(/^at aldersgrensen på materialet( ikke)? er høyere enn lånerens alder$/) do |belowagelimit|
  steps %Q{
    Gitt at det er aktivert en standard sirkulasjonsregel
    Og at det finnes aldersgrenser for utlån av materiale
  }
  if belowagelimit
    step "aldersgrense på materialet er \"3\" år"
  else
    step "aldersgrense på materialet er \"15\" år"
  end
end

When(/^aldersgrense på materialet er "(.*?)" år$/) do |agelimit|
  @browser.goto intranet(:mod_biblio)+@active[:book].biblionumber
  @browser.div(:id => "addbibliotabs").link(:href => "#tab5XX").click
  # remove mandatory javascript check
  @browser.execute_script("window.AreMandatoriesNotOk = function(msg){return false;}")
  @browser.textarea(:id => /^tag_521_subfield_a_[0-9_]+$/).set "Aldersgrense: #{agelimit}"
  @browser.button(:id => "saverecord").click

  step "systemet viser at materialet har aldersgrense \"#{agelimit}\" år"
end

Then(/^systemet viser at materialet har aldersgrense "(.*?)" år$/) do |agelimit|
  book = @active[:book]
  @browser.goto intranet(:biblio_detail)+book.biblionumber
  @browser.link(:href => "#description").click
  @browser.div(:id => "description").text.should include("Aldersgrense: "+agelimit)
end

Given(/^at det finnes følgende sirkulasjonsregler$/) do |ruletable|
  step "at jeg er på sida for sirkulasjonsregler"

  rules = ruletable.hashes

  table = @browser.table(:id => "default-circulation-rules")
  rules.each do |rule|
    row = table.tr(:index, -1) # append to last row
    row.select_list(:name => "categorycode").select_value "#{rule[:categorycode]}"
    row.select_list(:name => "itemtype").select_value "#{rule[:itemtype]}"
    row.text_field(:name => "maxissueqty").set "#{rule[:maxissueqty]}"
    row.text_field(:name => "issuelength").set "#{rule[:issuelength]}"
    row.text_field(:name => "reservesallowed").set "#{rule[:reservesallowed]}"
    row.select_list(:name => "onshelfholds").select_value "#{rule[:onshelfholds]}"
    row.input(:class => "submit").click
  end
end

Given(/^at materiale ikke automatisk overføres ved innlevering$/) do
  SVC::Preference.new(@browser).set("pref_AutomaticItemReturn", 0)
end

Given(/^at det finnes aldersgrenser for utlån av materiale$/) do
  SVC::Preference.new(@browser).set("pref_AgeRestrictionMarker", "|Aldersgrense:|Age|")
  @browser.goto intranet(:koha2marc_mapping)+"biblioitems&kohafield=agerestriction"
  form = @browser.label(:text => "500s").parent
  form.select_list(:name => "marc").select_value "521 a - Target audience note"
  form.submit

  step "systemet viser at aldersgrenser for utlån av materiale er aktivert"
end

Then(/^systemet viser at aldersgrenser for utlån av materiale er aktivert$/) do
  @browser.goto intranet(:search_preferences)+"agerestriction"
  @browser.text_field(:id => "pref_AgeRestrictionMarker").value.should eq("|Aldersgrense:|Age|")
end

Then(/^registrerer systemet at boka er utlånt$/) do
  @site.Home.visit.search_catalog @active[:book].title
  @browser.text.should include(@active[:book].title)
end


Then(/^systemet viser at låneren( ikke)? låner materialet$/) do |bool|
  text = @site.Patrons.
      visit.
      search(@active[:patron].cardnumber).
      show_checkouts.
      checkouts_text
  if bool
    text.should_not include(@active[:item].barcode)
  else
    text.should include(@active[:item].barcode)
  end
end

Then(/^at "(.*?)" låner boka$/) do |name|
  @browser.text.should include(@active[:book].title)
  @browser.text.should include "Checked out to #{name}"
end

Then(/^viser systemet at låneren ikke låner boka$/) do
  @site.Home.search_catalog @active[:book].title
  @browser.text.should include(@active[:book].title)
  @browser.text.should_not include "Checked out to Knut"
end

Given(/^at status (.*?) er innstilt med data$/) do |status,table|
  @browser.goto intranet(:authorised_values)
  s = @browser.select_list :id => 'searchfield'
  s.select "#{status}"
  d = @browser.table :id => 'table_authorized_values'
  p = d.hashes
  #Need to remove &nbsp; from captured data values
  p.each { |x| 
    x.each {|k,v|
      if /^\s$/.match(v)
        x.update({ k => ""})
      end
    }
  }
  table.diff!(p)
end

When(/^jeg leter opp boka i katalogiseringssøk$/) do
  @browser.goto intranet(:cataloguing)
  @browser.text_field(:name => 'q').set @active[:book].title
  @browser.form(:name => 'search').submit
  @browser.text.include?("Add/Edit items") == true
end

When(/^velger å redigere eksemplaret$/) do
  @browser.link(:text => 'Add/Edit items').click
  @browser.link(:text => 'Edit').click
end

When(/^jeg endrer status til "(.*?)"$/) do |status|
  def selector (subfield,status)
    s = @browser.select_list(:id => /^tag_952_subfield_#{subfield}_[0-9]+$/)
    s.select "#{status}" 
    @browser.button(:value => "Save changes").click
  end
  case status
  when "trukket tilbake"
    selector(0,status)
  when "borte i transport", "ikke på plass", "påstått ikke lånt", "påstått levert", "regnes som tapt", "retur eieravdeling (ved import)", "tapt", "tapt og erstattet", "tapt, regning betalt", "til henteavdeling (ved import)", "vidvanke, registrert forsvunnet"
    selector(1,status)
  when "skadet"
    selector(4,status)
  when "begrenset tilgang","referanseverk"
    selector(5,status)    
  when "i bestilling","ny","til innbinding","til internt bruk","til katalogisering","til retting","vurderes kassert"
    selector(7,status)
  end
end

Then(/^viser systemet at eksemplaret har status "(.*?)"$/) do |status|
  @browser.table(:id => "itemst").text.include?("#{status}").should == true
end

Given(/^at jeg er på sida for sirkulasjonsregler$/) do
  @browser.goto intranet(:circulation_rules)
end

Given(/^at sirkulasjonsreglene på sida stemmer overens med følgende data$/) do |table|
  table = table.raw()
  rows = @browser.table(:id => "default-circulation-rules").tbody.rows
  orig = []
  rows.each do |row| 
    orig << [row[0].text, row[1].text, row[2].text, row[3].text, row[4].text, row[5].text, row[6].text, row[7].text, row[8].text, row[9].text, row[10].text, row[11].text, row[12].text, row[13].text, row[14].text, row[15].text, row[16].text, row[17].text, row[18].text, row[19].text, row[20].text ]
  end
  orig.pop
  a = (table & orig == table)
  b = (orig & table == orig)

  a.should == true
  b.should == true
end
