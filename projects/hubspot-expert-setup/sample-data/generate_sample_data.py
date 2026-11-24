import csv, random, datetime as dt
from pathlib import Path
OUT = Path(__file__).resolve().parent  # CSVs are written next to this script
random.seed(42)
first = ["Sanne","Daan","Lotte","Bram","Femke","Jeroen","Inge","Ruben","Marloes","Thijs","Eva","Niels","Anouk","Joris","Lieke","Wouter","Mirjam","Koen","Esther","Sven","Floor","Pieter","Nina","Bas","Iris","Maarten","Roos","Tim","Hanna","Gijs","Elise","Stijn","Laura","Rick","Sophie","Jasper","Kim","Wim","Noor","Arjen"]
last = ["de Vries","Jansen","Bakker","Visser","Smit","Meijer","de Boer","Mulder","de Groot","Bos","Vos","Peters","Hendriks","van Dijk","Dekker","Brouwer","de Wit","Dijkstra","Smits","van den Berg","Kok","Jacobs","Vermeulen","Willems","Claes","Maes","Wouters","Goossens","Peeters","Janssens"]
pre = ["Noordkust","Polder","Dijkstra","Rivierland","Zuidas","Kempen","Delta","Veluwe","Waddenzee","Brabant","Eemland","Haven","Lage Landen","Maasvallei","Schelde","IJssel","Kustlijn","Randstad","Groene Hart","Vlaanderen","Utrecht","Twente","Zeeland","Limburg","Gooi","Amstel","Duin","Merwede","Vecht","Linge"]
suf = {"Construction":["Bouw","Bouwgroep","Aannemers"],"Civil Engineering":["Infra","Ingenieurs","Waterbouw"],"Information Technology and Services":["IT Diensten","Systems","Digital"],"Facilities Services":["Facility","Schoonmaak & Facility","Services"],"Retail":["Retail","Winkels"],"Hospitality":["Horeca","Hotels"],"Marketing and Advertising":["Media","Reclame"]}
icp = ["Construction","Civil Engineering","Information Technology and Services","Facilities Services"]
non = ["Retail","Hospitality","Marketing and Advertising"]
cities = {"Netherlands":["Amsterdam","Rotterdam","Utrecht","Eindhoven","Zwolle","Groningen","Arnhem","Breda"],"Belgium":["Antwerpen","Gent","Brussel","Leuven"],"Germany":["Düsseldorf","Köln"],"United Kingdom":["London","Leeds"]}

def slug(s): return "".join(c for c in s.lower().replace("&","en") if c.isalnum())
used=set()
def make_company(fit):
    while True:
        ind = random.choice(icp) if fit else random.choice(icp+non+non)
        name = f"{random.choice(pre)} {random.choice(suf[ind])}"
        if name not in used: used.add(name); break
    if fit:
        country = random.choices(["Netherlands","Belgium"],[3,1])[0]
        emp = random.choice([55,80,120,180,250,320,450,600,850])
    else:
        country = random.choices(["Netherlands","Belgium","Germany","United Kingdom"],[4,1,2,2])[0]
        emp = random.choice([4,8,12,25,35,1500,3000])
    return {"Company name":name,"Company domain name":slug(name)+".example.com","Industry":ind,"Number of employees":emp,"Country/Region":country,"City":random.choice(cities[country])}

titles_bm = ["Bid Manager","Tender Manager","Proposal Manager","Head of Bids"]
titles_cd = ["Commercial Director","Head of Sales","Managing Director"]
titles_other = ["Tender Writer","Marketing Manager","Office Manager","Student","Consultant"]

# (stage, count, source weights)
src = ["Google Ads","LinkedIn Ads","Meta Ads","Capterra","Webinar","Organic search","Outbound"]
plan = [
 ("lead",60,      [14,10,18,5,4,9,0]),
 ("mql_new",8,    [2,1,1,1,1,2,0]),
 ("mql_att",10,   [3,2,1,1,1,2,0]),
 ("mql_con",7,    [2,1,0,1,2,1,0]),
 ("mql_unq",28,   [4,4,12,1,1,5,1]),
 ("mql_bad",12,   [3,3,2,1,1,2,0]),
 ("sql",12,       [3,2,0,2,3,1,1]),
 ("opp_open",8,   [2,1,0,2,2,0,1]),
 ("opp_lost",10,  [3,2,0,1,1,1,2]),
 ("cust",5,       [1,0,0,1,2,0,1]),
]
unq_reasons = {"Meta Ads":["Student or job seeker","No tender activity","Company too small"],"default":["No budget","No tender activity","Company too small","Locked in with a competitor","Wrong contact"]}
stage_lab = {"lead":"Lead","mql":"Marketing Qualified Lead","sql":"Sales Qualified Lead","opp":"Opportunity","cust":"Customer"}
start = dt.date(2026,8,3); end = dt.date(2026,11,20)
def rdate(a,b): return a + dt.timedelta(days=random.randint(0,(b-a).days))

contacts=[]; deals=[]; companies={}
emails=set()
for stage,n,w in plan:
    for i in range(n):
        s = random.choices(src,w)[0]
        fit = stage!="lead" and stage!="mql_unq" or (stage=="lead" and random.random()<0.35) or (stage=="mql_unq" and random.random()<0.25)
        if s=="Meta Ads" and stage in ("lead","mql_unq"): fit = random.random()<0.15
        # reuse a company sometimes (buying committee)
        if fit and companies and random.random()<0.2:
            comp = random.choice([c for c in companies.values() if c["Industry"] in icp and c["_fit"]])
        else:
            comp = make_company(fit); comp["_fit"]=fit; companies[comp["Company name"]]=comp
        if fit:
            r = random.random()
            title = random.choice(titles_bm) if r<0.55 else random.choice(titles_cd) if r<0.9 else "Tender Writer"
        else:
            title = random.choice(titles_other + ["Bid Manager"])
        persona = "Bid Manager Bianca" if title in titles_bm else "Commercial Director Daan" if title in titles_cd else ""
        fn,ln = random.choice(first), random.choice(last)
        local = (fn[0]+"."+slug(ln)).lower()
        email = f"{local}@{comp['Company domain name']}"
        k=2
        while email in emails: email=f"{local}{k}@{comp['Company domain name']}"; k+=1
        emails.add(email)
        created = rdate(start,end)
        base = stage.split("_")[0]
        ls = {"mql_new":"New","mql_att":"Attempted to Contact","mql_con":"Connected","mql_unq":"Unqualified","mql_bad":"Bad Timing","sql":"Connected"}.get(stage, "Qualified (deal created)" if base in ("opp","cust") else "")
        reason = random.choice(unq_reasons.get(s, unq_reasons["default"])) if stage=="mql_unq" else ""
        if stage=="mql_unq" and not fit and reason=="No budget": reason="Company too small"
        contacts.append({"First name":fn,"Last name":ln,"Email":email,"Job title":title,"Persona":persona,
            "Lifecycle stage":stage_lab[base],"Lead status":ls,"Lead source":s,"Unqualified reason":reason,
            "Create date":created.isoformat(),
            **{k2:v for k2,v in comp.items() if not k2.startswith("_")}})
        if base in ("opp","cust"):
            amt = random.choice([18000,22000,24000,26000,28000,30000,32000,36000,40000,48000])
            if stage=="opp_open":
                st = random.choice(["Qualified To Buy","Presentation Scheduled","Decision Maker Bought-In","Contract Sent"]); close = rdate(dt.date(2026,12,1),dt.date(2027,2,26))
            elif stage=="opp_lost":
                st="Closed Lost"; close = rdate(max(created,dt.date(2026,9,15)),dt.date(2026,11,20))
            else:
                st="Closed Won"; close = rdate(max(created,dt.date(2026,9,15)),dt.date(2026,11,20))
            if close < created: close = created + dt.timedelta(days=21)
            deals.append({"Deal name":f"{comp['Company name']} – BidHarbor","Pipeline":"Sales Pipeline","Deal stage":st,"Amount":amt,"Close date":close.isoformat(),"Lead source":s,"Contact email":email})

cfields = list(contacts[0].keys())
with open(OUT / "bidharbor-contacts-companies.csv","w",newline="",encoding="utf-8") as f:
    wr=csv.DictWriter(f,fieldnames=cfields); wr.writeheader(); wr.writerows(contacts)
with open(OUT / "bidharbor-deals.csv","w",newline="",encoding="utf-8") as f:
    wr=csv.DictWriter(f,fieldnames=list(deals[0].keys())); wr.writeheader(); wr.writerows(deals)
print(len(contacts),"contacts",len(companies),"companies",len(deals),"deals")
import collections
print(collections.Counter((c["Lead source"],c["Lifecycle stage"]) for c in contacts).most_common(40))
