"""empty message

Revision ID: eedbb2919c5c
Revises: 80794d764ec4
Create Date: 2024-10-30 11:47:46.950307

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'eedbb2919c5c'
down_revision = '80794d764ec4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('treatmentencounter', schema=None) as batch_op:
        batch_op.drop_column('rootCanalLocation')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('treatmentencounter', schema=None) as batch_op:
        batch_op.add_column(sa.Column('rootCanalLocation', mysql.VARCHAR(length=255), nullable=True))

    # ### end Alembic commands ###
