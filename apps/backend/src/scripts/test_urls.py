import urllib.request, ssl

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

urls = [
    # Brinjal
    ('brinjal_1', 'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/e/r/7/12000-sedvgtbjlks-glorov-original-imahsmt2zyaqwbst.jpeg'),
    ('brinjal_2', 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Solanum_melongena_MHNT.BOT.2007.40.73.jpg'),
    ('brinjal_5', 'https://images.unsplash.com/photo-1683543122945-513029986574?w=1200&q=80'),
    # Cabbage
    ('cabbage_1', 'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/s/0/z/13000-sedvgtcbxtf-glorov-original-imahsndtka8r5xqf.jpeg'),
    ('cabbage_2', 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Raapstelen_gekiemde_zaden_%28Brassica_campestris_germinating_seeds%29.jpg'),
    ('cabbage_4', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=1200&q=80'),
    ('cabbage_5', 'https://images.unsplash.com/photo-1652860213441-6622f9fec77f?w=1200&q=80'),
    # Onion
    ('onion_1', 'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/r/x/d/1000-sedvgtonnje-glorov-original-imahs4gcdpqkzhsv.jpeg'),
    ('onion_4', 'https://images.unsplash.com/photo-1777499699424-e26d608008f4?w=1200&q=80'),
    ('onion_5', 'https://images.unsplash.com/photo-1559836833-2a2c99b1f54f?w=1200&q=80'),
    # Watermelon
    ('watermelon_1', 'https://images.unsplash.com/photo-1720239278431-bf2a0c838180?w=1200&q=80'),
    ('watermelon_4', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Citrullus_lanatus_03.JPG'),
    ('watermelon_5', 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=1200&q=80'),
    # Cucumber
    ('cucumber_1', 'https://images.unsplash.com/photo-1713869822431-c9b7429d0c6c?w=1200&q=80'),
    ('cucumber_4', 'https://upload.wikimedia.org/wikipedia/commons/5/52/Cucumis_sativus_02.JPG'),
    ('cucumber_5', 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=1200&q=80'),
    # Tomato harvest
    ('tomato_5', 'https://images.unsplash.com/photo-1724908097678-1cb50ee5e352?w=1200&q=80'),
    # Green chilli
    ('chilli_1', 'https://rukminim3.flixcart.com/image/1600/1600/xif0q/plant-seed/l/n/g/1000-sedvgtcpzw0-glorov-original-imahsng9w73dkwnh.jpeg'),
    # Petunia
    ('petunia_1', 'https://images.unsplash.com/photo-1780019763727-0e64a3a07e06?w=1200&q=80'),
    ('petunia_4', 'https://images.unsplash.com/photo-1786550028419-2f6696405f60?w=1200&q=80'),
    ('petunia_5', 'https://images.unsplash.com/photo-1655684843054-2bdbded9ff3c?w=1200&q=80'),
    # Dahlia
    ('dahlia_1', 'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/o/k/2/3-seddecrsw4id-glorov-original-imahrk8gkvhsfezr.jpeg'),
    ('dahlia_5', 'https://images.unsplash.com/photo-1617417715887-d51297ecdbca?w=1200&q=80'),
    # Marigold
    ('marigold_1', 'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/t/m/q/100-sedflwmgpl9-glorov-original-imahrk8gruwhdbjw.jpeg'),
    # Cosmos
    ('cosmos_1', 'https://rukminim2.flixcart.com/image/1600/1600/xif0q/plant-seed/z/o/c/40-sedvgtlfajm-glorov-original-imahrk8fqcbtxkdg.jpeg'),
    ('cosmos_5', 'https://images.unsplash.com/photo-1602615576820-ea14cf3e476a?w=1200&q=80'),
    # Chrysanthemum
    ('chrysanthemum_1', 'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?w=1200&q=80'),
    ('chrysanthemum_4', 'https://images.unsplash.com/photo-1580642178672-699fd3c0f399?w=1200&q=80'),
    ('chrysanthemum_5', 'https://images.unsplash.com/photo-1554727434-e842126abc82?w=1200&q=80'),
    # Portulaca
    ('portulaca_1', 'https://images.unsplash.com/photo-1613900526182-f03f7d91554c?w=1200&q=80'),
    ('portulaca_5', 'https://images.unsplash.com/photo-1618248982980-65d91c2ab467?w=1200&q=80'),
    # Basil
    ('basil_1', 'https://images.unsplash.com/photo-1630081015294-05e6a3044eeb?w=1200&q=80'),
    ('basil_4', 'https://images.unsplash.com/photo-1646983205802-0adf649e4a5a?w=1200&q=80'),
    ('basil_5', 'https://images.unsplash.com/photo-1776257217010-1c2e92207f2a?w=1200&q=80'),
    # Arugula
    ('arugula_1', 'https://images.unsplash.com/photo-1598998255418-566554056dbc?w=1200&q=80'),
    # Tulsi
    ('tulsi_1', 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Holy_Basil_edit2.jpg'),
    ('tulsi_4', 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Ocimum_tenuiflorum_5725.jpg'),
    ('tulsi_5', 'https://images.unsplash.com/photo-1664289283342-7dfd936b4b99?w=1200&q=80'),
    # Parsley
    ('parsley_1', 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Parsley_plant.jpg'),
    ('parsley_4', 'https://images.unsplash.com/photo-1590759485418-90509afec818?w=1200&q=80'),
    ('parsley_5', 'https://images.unsplash.com/photo-1721117090894-029c81cf0758?w=1200&q=80'),
    # Oregano
    ('oregano_1', 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Origanum_vulgare_-_harilik_pune.jpg'),
    ('oregano_4', 'https://images.unsplash.com/photo-1713260111133-30c5153e27cd?w=1200&q=80'),
    ('oregano_5', 'https://images.unsplash.com/photo-1690877468013-f5c174498a53?w=1200&q=80'),
    # Thyme
    ('thyme_1', 'https://images.unsplash.com/photo-1607721098274-e54cbfab475d?w=1200&q=80'),
    ('thyme_3', 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Thymus_seedling_D170813.jpg'),
    ('thyme_4', 'https://upload.wikimedia.org/wikipedia/commons/0/05/Thymus_vulgaris_001.JPG'),
    ('thyme_5', 'https://images.unsplash.com/photo-1679061584104-534b7ec4afe6?w=1200&q=80'),
]

for tag, url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            code = r.status
            size = len(r.read())
            print(f'✅ {tag}: {code} ({size} bytes)')
    except Exception as e:
        print(f'❌ {tag}: {e}')
