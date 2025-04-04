from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import uuid
import os

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Configure SQLite DB
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///apartments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define Apartment Model
class Apartment(db.Model):
    id = db.Column(db.String, primary_key=True)
    person = db.Column(db.String)
    phonenumber = db.Column(db.String)
    number = db.Column(db.Integer)
    description = db.Column(db.String)
    quality = db.Column(db.String)
    price = db.Column(db.Float)
    reference_type = db.Column(db.String)
    ref_id = db.Column(db.Integer)
    location = db.Column(db.String)
    sold = db.Column(db.Boolean, default=False)
    

# Create the database
with app.app_context():
    db.create_all()

@app.route("/")
def index():
    return render_template("form.html")

@app.route("/table")
def table():
    return render_template("table.html")

@app.route("/api/apartments", methods=["GET", "POST"])
def handle_apartments():
    if request.method == "POST":
        data = request.json
        apartment = Apartment(
            id=str(uuid.uuid4()),
            number=Apartment.query.count() + 1,
            description=data.get("description"),
            quality=data.get("quality"),
            price=float(data.get("price")),
            reference_type=data.get("reference_type"),
            ref_id=int(data.get("ref_id")),
            location=data.get("location"),
            person=data.get("person"),
            phonenumber=data.get("phonenumber"),
            sold=False
        )
        db.session.add(apartment)
        db.session.commit()
        return jsonify(apartment_to_dict(apartment)), 201
    else:
        apartments = Apartment.query.all()
        return jsonify([apartment_to_dict(apt) for apt in apartments])

@app.route("/api/apartments/<apartment_id>", methods=["PUT", "DELETE"])
def update_or_delete_apartment(apartment_id):
    apartment = Apartment.query.get(apartment_id)
    if not apartment:
        return jsonify({"error": "Apartment not found"}), 404

    if request.method == "PUT":
        data = request.json
        apartment.person=data.get("person", apartment.user)
        apartment.phonenumber = data.get("phonenumber", apartment.sold)
        apartment.description = data.get("description", apartment.description)
        apartment.quality = data.get("quality", apartment.quality)
        apartment.price = float(data.get("price", apartment.price))
        apartment.reference_type = data.get("reference_type", apartment.reference_type)
        apartment.ref_id = int(data.get("ref_id", apartment.ref_id))
        apartment.location = data.get("location", apartment.location)
        apartment.sold = data.get("sold", apartment.sold)
        
        db.session.commit()
        return jsonify(apartment_to_dict(apartment))

    elif request.method == "DELETE":
        db.session.delete(apartment)
        db.session.commit()
        return '', 204

@app.route("/api/apartments/<apartment_id>/sold", methods=["PATCH"])
def mark_apartment_sold(apartment_id):
    apartment = Apartment.query.get(apartment_id)
    if not apartment:
        return jsonify({'error': 'Not found'}), 404

    apartment.sold = True
    db.session.commit()
    return jsonify({'success': True, 'id': apartment.id})

# Helper function to serialize Apartment
def apartment_to_dict(apartment):
    return {
        "id": apartment.id,
        "person": apartment.person,
        "phonenumber": apartment.phonenumber,
        "number": apartment.number,
        "description": apartment.description,
        "quality": apartment.quality,
        "price": apartment.price,
        "reference_type": apartment.reference_type,
        "ref_id": apartment.ref_id,
        "location": apartment.location,
        "sold": apartment.sold,
         # ISO 8601 format for timestamps
    }



if __name__ == "__main__":
    app.run(debug=True)
