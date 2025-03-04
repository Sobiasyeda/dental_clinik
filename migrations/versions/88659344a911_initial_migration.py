"""initial migration

Revision ID: 88659344a911
Revises: 
Create Date: 2024-08-29 14:10:18.259426

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '88659344a911'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('access',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('clinic_name', sa.String(length=255), nullable=True),
    sa.Column('role', sa.String(length=255), nullable=True),
    sa.Column('register_patient', sa.Boolean(), nullable=True),
    sa.Column('calendar', sa.Boolean(), nullable=True),
    sa.Column('emr', sa.Boolean(), nullable=True),
    sa.Column('past_history', sa.Boolean(), nullable=True),
    sa.Column('treatment_plan', sa.Boolean(), nullable=True),
    sa.Column('reports', sa.Boolean(), nullable=True),
    sa.Column('bill', sa.Boolean(), nullable=True),
    sa.Column('bill_details', sa.Boolean(), nullable=True),
    sa.Column('old_bills', sa.Boolean(), nullable=True),
    sa.Column('expenses', sa.Boolean(), nullable=True),
    sa.Column('stock', sa.Boolean(), nullable=True),
    sa.Column('dashboard', sa.Boolean(), nullable=True),
    sa.Column('main_admin', sa.Boolean(), nullable=True),
    sa.Column('add_user', sa.Boolean(), nullable=True),
    sa.Column('change_user_status', sa.Boolean(), nullable=True),
    sa.Column('price_list', sa.Boolean(), nullable=True),
    sa.Column('access_roles', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('bookingEncounter',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('patient_id', sa.String(length=255), nullable=True),
    sa.Column('encounter_id', sa.String(length=255), nullable=True),
    sa.Column('visit_date', sa.Date(), nullable=True),
    sa.Column('start_time', sa.String(length=255), nullable=True),
    sa.Column('end_time', sa.String(length=255), nullable=True),
    sa.Column('patient_name', sa.String(length=255), nullable=True),
    sa.Column('patient_family_name', sa.String(length=255), nullable=True),
    sa.Column('dob', sa.String(length=255), nullable=True),
    sa.Column('phone', sa.String(length=255), nullable=True),
    sa.Column('procedure', sa.String(length=255), nullable=True),
    sa.Column('doctor_name', sa.String(length=255), nullable=True),
    sa.Column('doctor_id', sa.String(length=255), nullable=True),
    sa.Column('booking_confirmation', sa.String(length=255), nullable=True),
    sa.Column('appointment_reminder', sa.String(length=255), nullable=True),
    sa.Column('prior_instructions', sa.String(length=255), nullable=True),
    sa.Column('post_instructions', sa.String(length=255), nullable=True),
    sa.Column('user_id', sa.String(length=255), nullable=True),
    sa.Column('clinic_name', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('expenses',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('userName', sa.String(length=255), nullable=True),
    sa.Column('category', sa.String(length=255), nullable=True),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.Column('supplier', sa.String(length=255), nullable=True),
    sa.Column('cost', sa.String(length=255), nullable=True),
    sa.Column('invoiceNumber', sa.String(length=255), nullable=True),
    sa.Column('invoiceDate', sa.Date(), nullable=True),
    sa.Column('equipmentPrice', sa.Numeric(), nullable=True),
    sa.Column('equipmentDuration', sa.String(length=255), nullable=True),
    sa.Column('equipmentBrand', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('patientInfo',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('family', sa.String(length=255), nullable=True),
    sa.Column('father', sa.String(length=255), nullable=True),
    sa.Column('dob', sa.String(length=255), nullable=True),
    sa.Column('phone', sa.String(length=255), nullable=True),
    sa.Column('gender', sa.String(length=255), nullable=True),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('city', sa.String(length=255), nullable=True),
    sa.Column('allergy', sa.String(length=255), nullable=True),
    sa.Column('allergy_reaction', sa.String(length=255), nullable=True),
    sa.Column('clinic_name', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('pricing',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.Column('price', sa.Numeric(), nullable=True),
    sa.Column('icon', sa.String(length=255), nullable=True),
    sa.Column('category', sa.String(length=255), nullable=True),
    sa.Column('clinic_name', sa.String(length=255), nullable=True),
    sa.Column('user_id', sa.String(length=255), nullable=True),
    sa.Column('date', sa.Date(), nullable=True),
    sa.Column('user_name', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('procedures',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('procedureDescription', sa.String(length=255), nullable=True),
    sa.Column('procedureIcon', sa.String(length=255), nullable=True),
    sa.Column('procedureCategory', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('role',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('rootcanal',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('tooth_number', sa.String(length=255), nullable=True),
    sa.Column('tooth_path', sa.String(length=255), nullable=True),
    sa.Column('root_canal_left', sa.String(length=255), nullable=True),
    sa.Column('root_canal_right', sa.String(length=255), nullable=True),
    sa.Column('root_canal_middle', sa.String(length=255), nullable=True),
    sa.Column('root_canal_lower', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('system_admin_access',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.String(length=255), nullable=True),
    sa.Column('main_system_admin', sa.Boolean(), nullable=True),
    sa.Column('add_system_admin', sa.Boolean(), nullable=True),
    sa.Column('access_system_admin', sa.Boolean(), nullable=True),
    sa.Column('add_clinic_user', sa.Boolean(), nullable=True),
    sa.Column('add_sub_users', sa.Boolean(), nullable=True),
    sa.Column('change_clinic_user_status', sa.Boolean(), nullable=True),
    sa.Column('set_clinic_prices', sa.Boolean(), nullable=True),
    sa.Column('clinic_access_roles', sa.Boolean(), nullable=True),
    sa.Column('set_clinic_procedures', sa.Boolean(), nullable=True),
    sa.Column('reset_user_password', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('systemadmin',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('family', sa.String(length=255), nullable=True),
    sa.Column('father', sa.String(length=255), nullable=True),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('status', sa.String(length=255), nullable=True),
    sa.Column('phone', sa.String(length=255), nullable=True),
    sa.Column('hashed_password', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('clinicName', sa.String(length=255), nullable=True),
    sa.Column('role', sa.String(length=255), nullable=True),
    sa.Column('doctor_id', sa.String(length=255), nullable=True),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('family', sa.String(length=255), nullable=True),
    sa.Column('father', sa.String(length=255), nullable=True),
    sa.Column('phone', sa.String(length=255), nullable=True),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('hashed_password', sa.String(length=255), nullable=True),
    sa.Column('status', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('treatmentencounter',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('patientId', sa.Integer(), nullable=True),
    sa.Column('userId', sa.String(length=255), nullable=True),
    sa.Column('diagnosis', sa.String(length=255), nullable=True),
    sa.Column('procedure', sa.String(length=255), nullable=True),
    sa.Column('fees', sa.Numeric(), nullable=True),
    sa.Column('discount', sa.Float(), nullable=True),
    sa.Column('toothNumber', sa.String(length=255), nullable=True),
    sa.Column('status', sa.String(length=255), nullable=True),
    sa.Column('statusDate', sa.Date(), nullable=True),
    sa.Column('provider', sa.String(length=255), nullable=True),
    sa.Column('clinicName', sa.String(length=255), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('rootCanalLocation', sa.String(length=255), nullable=True),
    sa.Column('billSequenceNumber', sa.String(length=255), nullable=True),
    sa.Column('netPrice', sa.Numeric(), nullable=True),
    sa.Column('amountPaid', sa.Numeric(), nullable=True),
    sa.Column('writeOff', sa.Numeric(), nullable=True),
    sa.Column('remainingBalance', sa.Numeric(), nullable=True),
    sa.Column('patient_disposition', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['patientId'], ['patientInfo.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('treatmentencounter')
    op.drop_table('user')
    op.drop_table('systemadmin')
    op.drop_table('system_admin_access')
    op.drop_table('rootcanal')
    op.drop_table('role')
    op.drop_table('procedures')
    op.drop_table('pricing')
    op.drop_table('patientInfo')
    op.drop_table('expenses')
    op.drop_table('bookingEncounter')
    op.drop_table('access')
    # ### end Alembic commands ###
